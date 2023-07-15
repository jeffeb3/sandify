import ReactGA from "react-ga"
import throttle from "lodash/throttle"
import PolarMachine from "./PolarMachine"
import RectMachine from "./RectMachine"
import { getModelFromType } from "../../config/models"
import Victor from "victor"

//function track(vertex, data, loopIndex) {
//  const angle = data.trackLength * loopIndex / 16 * 2.0 * Math.PI
//  let radius = 1.0

//  if (data.trackGrowEnabled) {
//    radius = 1.0 + loopIndex / 10.0 * data.trackGrow / 100.0
//  }
//  return new Victor(
//    vertex.x + radius * data.trackValue * Math.cos(angle),
//    vertex.y + radius * data.trackValue * Math.sin(angle)
//  )
//}

// TODO: this is likely going away
// function buildTrackLoop(vertices, transform, i, t) {
//  const numLoops = transform.repeatEnabled ? transform.numLoops : 1
//  const numTrackLoops = transform.repeatEnabled ? transform.trackNumLoops : 1
//  const nextTrackVertex = transformShape(transform, vertices[0], 0, i + 1, numTrackLoops)
//  const backtrack = numTrackLoops > 1 && t === numTrackLoops - 1
//  let trackVertices = []
//  let trackDistances = []
//  const drawPortionPct = Math.round((transform.drawPortionPct || 100)/100.0 * vertices.length)
//  const completion = (i === numLoops - 1 && t === numTrackLoops - 1) ? drawPortionPct : vertices.length

//  for (var j=0; j<completion; j++) {
//    const amount = transform.transformMethod === 'smear' ? i + t + j/vertices.length : i + t
//    const trackVertex = transformShape(transform, vertices[j], amount, i, numTrackLoops)
//    trackVertices.push(trackVertex)

//    if (backtrack && completion === vertices.length) {
//      trackDistances.push(distance(nextTrackVertex, trackVertex))
//    }
//  }

// backtrack to the vertex with the shortest distance to the first vertex in
// the next track loop; this minimizes the amount our shape draws over the
// previous shape, which is not visually appealing.
//  if (backtrack) {
//    let minIdx = 0
//    let minD = Number.MAX_SAFE_INTEGER

//    trackDistances.forEach((d, idx) => {
//      if (d <= minD) {
//        minD = d
//        minIdx = idx
//      }
//    })

//    if (minIdx !== 0) {
//      trackVertices = trackVertices.concat(trackVertices.slice(minIdx, trackVertices.length-1).reverse())
//    }
//  }

//  return trackVertices
//}

// ensure vertices do not exceed machine boundary limits, and endpoints as needed
export const polishVertices = (vertices, machine, layerInfo = {}) => {
  vertices = vertices.map((vertex) => Victor.fromObject(vertex))

  if (vertices.length > 0) {
    const machineInstance = getMachineInstance(vertices, machine, layerInfo)
    vertices = machineInstance.polish().vertices
  }

  return vertices
}

function reportTiming(time) {
  time = Math.max(time, 0.01)
  ReactGA.timing({
    category: "Compute",
    variable: "transformShapes",
    value: time, // in milliseconds
  })
}

const throttledReportTiming = throttle(reportTiming, 1000, { trailing: true })

export const transformShapes = (vertices, layer, effects) => {
  const startTime = performance.now()
  //  const numLoops = layer.repeatEnabled ? layer.numLoops : 1
  //  const numTrackLoops = layer.repeatEnabled ? layer.trackNumLoops : 1
  let outputVertices = vertices.map((vertex) => vertex.clone())
  //  if (layer.autosize) {
  //    vertices = vertices.map(vertex => {
  //      return scale(vertex, 100.0 * layer.startingWidth, 100 * layer.startingHeight)
  //    })
  //  }

  // TODO: remove this
  //  if (layer.trackEnabled && numTrackLoops > 1) {
  //    for (var i=0; i<numLoops; i++) {
  //      for (var t=0; t<numTrackLoops; t++) {
  //        outputVertices = outputVertices.concat(buildTrackLoop(vertices, layer, i, t))
  //      }
  //    }
  //  } else {
  //    for (let i=0; i<numLoops; i++) {
  //  for (var j=0; j<vertices.length; j++) {
  //    let amount = j/vertices.length
  //    outputVertices.push(transformShape(layer, vertices[j], amount, amount))
  //  }
  //    }
  //  }

  if (layer.reverse) {
    outputVertices = outputVertices.reverse()
  }

  if (effects && effects.length > 0) {
    effects.forEach((effect) => {
      outputVertices = getModelFromType(effect.type).applyEffect(
        effect,
        layer,
        outputVertices,
      )
    })
  }

  const endTime = performance.now()
  throttledReportTiming(endTime - startTime)

  return outputVertices
}

// returns the appropriate machine class for given machine properties
export const getMachineInstance = (vertices, settings, layerInfo) => {
  const machineClass = settings.rectangular ? RectMachine : PolarMachine
  return new machineClass(vertices, settings, layerInfo)
}
