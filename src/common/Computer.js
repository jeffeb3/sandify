import { Vertex } from './Geometry'
import {
  enforceRectLimits,
  enforcePolarLimits
} from './LimitEnforcer'
import { getShape } from '../features/shapes/selectors'
import Victor from 'victor'

// Transform functions
function rotate (vertex, angleDeg) {
  var angle = Math.PI / 180.0 * angleDeg
  return Vertex(
           vertex.x * Math.cos(angle) - vertex.y * Math.sin(angle),
           vertex.x * Math.sin(angle) + vertex.y * Math.cos(angle),
           vertex.f)
}

function scale (vertex, scale_perc) {
  var scale = scale_perc / 100.0
  return {
    x: vertex.x * scale,
    y: vertex.y * scale,
    f: vertex.f,
  }
}

function offset (vertex, offsetX, offsetY) {
  return {
    x: vertex.x + offsetX,
    y: vertex.y + offsetY,
    f: vertex.f,
  }
}

function track (vertex, data, loop_index) {
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

export const transform = (data, vertex, fraction_index) => {
  var transformed_vertex = vertex

  if (data.repeatEnabled && data.growEnabled) {
    transformed_vertex = scale(transformed_vertex, 100.0 + (data.growValue * fraction_index))
  }

  transformed_vertex = offset(transformed_vertex, data.offsetX || 0, data.offsetY || 0)

  if (data.repeatEnabled && data.spinEnabled) {
    const loop_period = data.numLoops / (parseInt(data.spinSwitchbacks) + 1)
    const stage = fraction_index/loop_period
    const direction = (stage % 2 < 1 ? 1.0 : -1.0)
    var spin_amount = direction * (fraction_index % loop_period) * data.spinValue

    // Add in the amount it goes positive to the negatives, so they start at the same place.
    if (direction < 0.0) {
      spin_amount += loop_period * data.spinValue
    }
    transformed_vertex = rotate(transformed_vertex, spin_amount)
  }

  if (data.repeatEnabled && data.trackEnabled) {
    transformed_vertex = track(transformed_vertex, data, fraction_index)
  }

  return transformed_vertex
}

// Vertex functions
export const polishVertices = (state, vertices) => {
  let machine = state.machine
  if (vertices.length > 0) {
    if (machine.rectangular && machine.rectOrigin.length === 1) {

      // OK, let's assign corners indices:
      //
      // [1]   [2]
      //
      //
      // [0]   [3]
      let dx = (machine.maxX - machine.minX) / 2.0
      let dy = (machine.maxY - machine.minY) / 2.0

      let corners = [
        {x: -dx, y: -dy},
        {x: -dx, y:  dy},
        {x:  dx, y:  dy},
        {x:  dx, y: -dy}
      ]
      console.log(corners)

      let first = vertices[0]
      let last = vertices[vertices.length-1]

      // Max radius
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
      console.log(outPoint)
      console.log(dx)

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
      // console.log("nextCorner: " + nextCorner)
      // newVertices.push({ ...first, x: corners[nextCorner].x, y: corners[nextCorner].y})

      while (nextCorner !== machine.rectOrigin[0]) {
        console.log("nextCorner: " + nextCorner)
        newVertices.push({ ...first, x: corners[nextCorner].x, y: corners[nextCorner].y})
        nextCorner -= 1
        if (nextCorner < 0) {
          nextCorner = 3
        }
      }
      console.log("nextCorner: " + nextCorner)
      newVertices.push({ ...first, x: corners[nextCorner].x, y: corners[nextCorner].y})

      console.log(newVertices)
      if (vFirst.magnitude() <= vLast.magnitude()) {
        // outward
        vertices = vertices.concat(newVertices)
      } else {
        vertices = newVertices.reverse().concat(vertices)
      }
    }
    if (machine.polarEndpoints && !machine.rectangular) {

      let first = vertices[0]
      let last = vertices[vertices.length-1]

      // Always put 0.0 in there

      // Max radius
      let maxRadius = machine.maxRadius
      let vFirst = Victor.fromObject(first)
      let vLast = Victor.fromObject(last)
      if (vFirst.magnitude() <= vLast.magnitude()) {
        // It's going outward
        let scale = maxRadius / vLast.magnitude()
        let outPoint = vLast.multiply(Victor(scale,scale))
        vertices.unshift(Vertex(0.0, 0.0, first.f))
        vertices.push(Vertex(outPoint.x, outPoint.y, last.f))
      } else {
        let scale = maxRadius / vFirst.magnitude()
        let outPoint = vFirst.multiply(Victor(scale,scale))
        vertices.push(Vertex(0.0, 0.0, first.f))
        vertices.unshift(Vertex(outPoint.x, outPoint.y, last.f))
      }
    }
  }

  if (state.gcode.reverse) {
    vertices.reverse()
  }
  if (machine.rectangular) {
    vertices = enforceRectLimits(vertices,
                                 (machine.maxX - machine.minX)/2.0,
                                 (machine.maxY - machine.minY)/2.0
                                 )
  } else {
    vertices = enforcePolarLimits(vertices,
                                  machine.maxRadius
                                  )
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

  var newVertices = state.file.vertices.map( (vertex) => {
    return {...vertex,
      x: vertex.x * x_scale,
      y: vertex.y * y_scale,
    }
  })
  return polishVertices(state, newVertices)
}

export const transformShapes = (state) => {
  const shape = getShape(state.shape)
  let input = []

  if (shape) {
    input = shape.getVertices(state).map( (vertex) => {
      return scale(vertex, 100.0 * state.shape.startingSize)
    })
  }

  const numLoops = state.transform.repeatEnabled ? state.transform.numLoops : 1
  let outputVertices = []

  for (var i=0; i<numLoops; i++) {
    for (var j=0; j<input.length; j++) {
      let fraction = j/input.length
      outputVertices.push(transform(state.transform, input[j], i+fraction))
    }
  }

  return polishVertices(state, outputVertices)
}
