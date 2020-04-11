import { distance } from '../../common/Geometry'
import { polishPolarVertices } from './polarMachine'
import { polishRectVertices } from './rectMachine'
import { getShape } from '../shapes/selectors'
import Victor from 'victor'
import ReactGA from 'react-ga'
import throttle from 'lodash/throttle'

// Transform functions
function rotate(vertex, angleDeg) {
  var angle = Math.PI / 180.0 * angleDeg
  return new Victor(
   vertex.x * Math.cos(angle) - vertex.y * Math.sin(angle),
   vertex.x * Math.sin(angle) + vertex.y * Math.cos(angle)
  )
}

function scale(vertex, scalePerc) {
  var scale = scalePerc / 100.0
  return new Victor(
    vertex.x * scale,
    vertex.y * scale
  )
}

function offset(vertex, offsetX, offsetY) {
  return new Victor(
    vertex.x + offsetX,
    vertex.y + offsetY
  )
}

function track(vertex, data, loopIndex) {
  let angle = data.trackLength * loopIndex / 16 * 2.0 * Math.PI
  let radius = 1.0

  if (data.trackGrowEnabled) {
    radius = 1.0 + loopIndex / 10.0 * data.trackGrow / 100.0
  }
  return new Victor(
    vertex.x + radius * data.trackValue * Math.cos(angle),
    vertex.y + radius * data.trackValue * Math.sin(angle)
  )
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
  let vertices = shape.getVertices(state).map(vertex => {
    return scale(vertex, 100.0 * state.shape.startingSize)
  })

  if (state.transform.transformMethod === 'smear' && state.transform.repeatEnabled) {
    // remove last vertex; we don't want to return to our starting point when completing the shape
    vertices.pop()
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
    const amount = state.transform.transformMethod === 'smear' ? i + t + j/input.length : i + t
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
  vertices = vertices.map(vertex => Victor.fromObject(vertex))

  if (vertices.length > 0) {
    if (state.machine.rectangular) {
      vertices = polishRectVertices(vertices, state.machine)
    } else {
      vertices = polishPolarVertices(vertices, state.machine)
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

function reportTiming(time) {
  time = Math.max(time, 0.01)
  ReactGA.timing({
    category: 'Compute',
    variable: 'transformShapes',
    value: time, // in milliseconds
  });
}

const throttledReportTiming = throttle(reportTiming, 1000, {trailing: true })

export const transformShapes = (state) => {
  const startTime = performance.now()
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
          let amount = state.transform.transformMethod === 'smear' ? i + j/input.length : i
          outputVertices.push(transform(state.transform, input[j], amount, amount))
        }
      }
    }
  }

  const rv = polishVertices(state, outputVertices)
  const endTime = performance.now()
  throttledReportTiming(endTime - startTime)
  return rv
}
