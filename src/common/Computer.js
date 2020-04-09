import { Vertex, distance } from './Geometry'
import { enforceRectLimits, enforcePolarLimits } from './LimitEnforcer'
import { getShape } from '../features/shapes/selectors'
import Victor from 'victor'

// Transform functions
function rotate(vertex, angleDeg) {
  var angle = Math.PI / 180.0 * angleDeg
  return Vertex(
           vertex.x * Math.cos(angle) - vertex.y * Math.sin(angle),
           vertex.x * Math.sin(angle) + vertex.y * Math.cos(angle),
           vertex.f)
}

function scale(vertex, scale_perc) {
  var scale = scale_perc / 100.0
  return {
    x: vertex.x * scale,
    y: vertex.y * scale,
    f: vertex.f,
  }
}

function offset(vertex, offsetX, offsetY) {
  return {
    x: vertex.x + offsetX,
    y: vertex.y + offsetY,
    f: vertex.f,
  }
}

function track(vertex, data, loop_index) {
  let angle = data.trackLength * loop_index / 16 * 2.0 * Math.PI
  let radius = 1.0
  if (data.trackGrowEnabled) {
    radius = 1.0 + loop_index / 10.0 * data.trackGrow / 100.0
  }
  return {
    x: vertex.x + radius * data.trackValue * Math.cos(angle),
    y: vertex.y + radius * data.trackValue * Math.sin(angle),
    f: vertex.f, // Why do I still have f in here?
  }
}

export const transform = (data, vertex, amount, trackIndex=0, numLoops) => {
  numLoops = numLoops || data.numLoops
  let transformedVertex = vertex

  if (data.repeatEnabled && data.growEnabled) {
    transformedVertex = scale(transformedVertex, 100.0 + (data.growValue * amount))
  }

  transformedVertex = offset(transformedVertex, data.offsetX || 0, data.offsetY || 0)

  if (data.repeatEnabled && data.spinEnabled) {
    const loopPeriod = numLoops / (parseInt(data.spinSwitchbacks) + 1)
    const stage = amount/loopPeriod
    const direction = (stage % 2 < 1 ? 1.0 : -1.0)
    var spinAmount = direction * (amount % loopPeriod) * data.spinValue

    // Add in the amount it goes positive to the negatives, so they start at the same place.
    if (direction < 0.0) {
      spinAmount += loopPeriod * data.spinValue
    }
    transformedVertex = rotate(transformedVertex, spinAmount)
  }

  if (data.repeatEnabled && data.trackEnabled) {
    transformedVertex = track(transformedVertex, data, trackIndex)
  }

  return transformedVertex
}

// Vertex functions
const getShapeVertices = (state) => {
  const shape = getShape(state.shape)
  return shape.getVertices(state).map(vertex => {
    return scale(vertex, 100.0 * state.shape.startingSize)
  })
}

function addRectEndpoints(machine, vertices) {
  // OK, let's assign corners indices:
  //
  // [1]   [2]
  //
  //
  // [0]   [3]
  const dx = (machine.maxX - machine.minX) / 2.0
  const dy = (machine.maxY - machine.minY) / 2.0
  const corners = [
    {x: -dx, y: -dy},
    {x: -dx, y:  dy},
    {x:  dx, y:  dy},
    {x:  dx, y: -dy}
  ]

  let first = vertices[0]
  let last = vertices[vertices.length-1]
  let maxRadius = Math.sqrt(Math.pow(2.0*dx,2.0) + Math.pow(2.0*dy, 2.0)) / 2.0
  let vFirst = Victor.fromObject(first)
  let vLast = Victor.fromObject(last)
  let outPoint
  let newVertices = []

  if (vFirst.magnitude() <= vLast.magnitude()) {
    // It's going outward
    let scale = maxRadius / vLast.magnitude()
    outPoint = vLast.multiply(Victor(scale,scale))
    newVertices.push({ ...last, x: outPoint.x, y: outPoint.y})
  } else {
    let scale = maxRadius / vFirst.magnitude()
    outPoint = vFirst.multiply(Victor(scale,scale))
    newVertices.push({ ...first, x: outPoint.x, y: outPoint.y})
  }

  let nextCorner = 1
  if (outPoint.x >= dx) {
    // right
    nextCorner = 2
  } else if (outPoint.x <= -dx) {
    // left
    nextCorner = 0
  } else if (outPoint.y >= dy) {
    // up
    nextCorner = 1
  } else if (outPoint.y <= -dy) {
    // down
    nextCorner = 3
  } else {
    console.log("Darn!")
    nextCorner = 3
  }

  while (nextCorner !== machine.rectOrigin[0]) {
    newVertices.push({ ...first, x: corners[nextCorner].x, y: corners[nextCorner].y})
    nextCorner -= 1
    if (nextCorner < 0) {
      nextCorner = 3
    }
  }

  newVertices.push({ ...first, x: corners[nextCorner].x, y: corners[nextCorner].y})

  if (vFirst.magnitude() <= vLast.magnitude()) {
    // outward
    vertices = vertices.concat(newVertices)
  } else {
    vertices = newVertices.reverse().concat(vertices)
  }

  return vertices
}

function addPolarEndpoints(machine, vertices) {
  const maxRadius = machine.maxRadius

  if (machine.polarStartPoint !== 'none') {
    if (machine.polarStartPoint === 'center') {
      vertices.unshift(Vertex(0.0, 0.0))
    } else {
      const first = Victor.fromObject(vertices[0])
      const scale = maxRadius / first.magnitude()
      const startPoint = first.multiply(Victor(scale, scale))
      vertices.unshift(Vertex(startPoint.x, startPoint.y))
    }
  }

  if (machine.polarEndPoint !== 'none') {
    if (machine.polarEndPoint === 'center') {
      vertices.push(Vertex(0.0, 0.0))
    } else {
      const last = Victor.fromObject(vertices[vertices.length-1])
      const scale = maxRadius / last.magnitude()
      const endPoint = last.multiply(Victor(scale, scale))
      vertices.push(Vertex(endPoint.x, endPoint.y))
    }
  }

  return vertices
}

function buildTrackLoop(state, i, t) {
  const input = getShapeVertices(state)
  const numTrackLoops = state.transform.repeatEnabled ? state.transform.trackNumLoops : 1
  const nextTrackVertex = transform(state.transform, input[0], 0, i + 1, numTrackLoops)
  const backtrack = numTrackLoops > 1 && t === numTrackLoops - 1
  let numVertices = input.length
  let trackVertices = []
  let trackDistances = []

  for (var j=0; j<numVertices; j++) {
    const amount = state.transform.transformFrequency === 'point' ? i + t + j/input.length : i + t
    const trackVertex = transform(state.transform, input[j], amount, i, numTrackLoops)
    trackVertices.push(trackVertex)

    if (backtrack) {
      trackDistances.push(distance(nextTrackVertex, trackVertex))
    }
  }

  // backtrack to the vertex with the shortest distance to the first vertex in
  // the next track loop; this minimizes the amount our shape draws over the
  // previous shape, which is not visually appealing.
  if (backtrack) {
    let minIdx = 0
    let minD = Number.MAX_SAFE_INTEGER

    trackDistances.forEach((d, idx) => {
      if (d <= minD) {
        minD = d
        minIdx = idx
      }
    })

    if (minIdx !== 0) {
      trackVertices = trackVertices.concat(trackVertices.slice(minIdx, trackVertices.length-1).reverse())
    }
  }

  return trackVertices
}

// ensure vertices do not exceed machine boundary limits, and endpoints as needed
export const polishVertices = (state, vertices) => {
  const machine = state.machine

  if (vertices.length > 0) {
    if (machine.rectangular) {
      if (machine.rectOrigin.length === 1) {
        vertices = addRectEndpoints(machine, vertices)
      }

      const sizeX = (machine.maxX - machine.minX)/2.0
      const sizeY = (machine.maxY - machine.minY)/2.0
      vertices = enforceRectLimits(vertices, sizeX, sizeY)
    } else {
      vertices = addPolarEndpoints(machine, vertices)
      vertices = enforcePolarLimits(vertices, machine.maxRadius)
    }
  }

  if (state.gcode.reverse) {
    vertices.reverse()
  }

  return vertices
}

export const thetaRho = (state) => {
  let machine = state.machine
  var x_scale = (machine.maxX - machine.minX)/2.0 * 0.01 * state.file.zoom
  var y_scale = (machine.maxY - machine.minY)/2.0 * 0.01 * state.file.zoom
  if (!machine.rectangular) {
    x_scale = y_scale = machine.maxRadius
  }
  x_scale *= 0.01 * state.file.zoom
  y_scale *= 0.01 * state.file.zoom
  if (state.file.aspectRatio) {
    x_scale = y_scale = Math.min(x_scale,y_scale)
  }

  const newVertices = state.file.vertices.map( (vertex) => {
    return {...vertex,
      x: vertex.x * x_scale,
      y: vertex.y * y_scale,
    }
  })
  return polishVertices(state, newVertices)
}

export const transformShapes = (state) => {
  const input = getShapeVertices(state)
  const numLoops = state.transform.repeatEnabled ? state.transform.numLoops : 1
  const numTrackLoops = state.transform.repeatEnabled ? state.transform.trackNumLoops : 1
  let outputVertices = []

  for (var i=0; i<numLoops; i++) {
    if (state.transform.trackEnabled && numTrackLoops > 1) {
      for (var t=0; t<numTrackLoops; t++) {
        outputVertices = outputVertices.concat(buildTrackLoop(state, i, t))
      }
    } else {
      for (i=0; i<numLoops; i++) {
        for (var j=0; j<input.length; j++) {
          let amount = state.transform.transformFrequency === 'point' ? i + j/input.length : i
          outputVertices.push(transform(state.transform, input[j], amount, amount))
        }
      }
    }
  }

  return polishVertices(state, outputVertices)
}
