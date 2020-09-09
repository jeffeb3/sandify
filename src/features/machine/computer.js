import ReactGA from 'react-ga'
import throttle from 'lodash/throttle'
import { evaluate } from 'mathjs'
import { distance, scale, rotate } from '../../common/geometry'
import { arrayRotate } from '../../common/util'
import PolarMachine from './PolarMachine'
import RectMachine from './RectMachine'
import Victor from 'victor'

function track(vertex, data, loopIndex) {
  const angle = data.trackLength * loopIndex / 16 * 2.0 * Math.PI
  let radius = 1.0

  if (data.trackGrowEnabled) {
    radius = 1.0 + loopIndex / 10.0 * data.trackGrow / 100.0
  }
  return new Victor(
    vertex.x + radius * data.trackValue * Math.cos(angle),
    vertex.y + radius * data.trackValue * Math.sin(angle)
  )
}

export const transformShape = (data, vertex, amount, trackIndex=0, numLoops) => {
  numLoops = numLoops || data.numLoops
  let transformedVertex = vertex

  if (data.repeatEnabled && data.growEnabled) {
    let growAmount = 100
    if (data.growMethod === 'function') {
      try {
        growAmount = data.growValue * evaluate(data.growMath, {i: amount})
      }
      catch (err) {
        console.log("Error parsing grow function: " + err)
        growAmount = 200
      }
    } else {
      growAmount = 100.0 + (data.growValue * amount)
    }
    transformedVertex = scale(transformedVertex, growAmount)
  }

  if (data.repeatEnabled && data.spinEnabled) {
    let spinAmount = 0
    if (data.spinMethod === 'function') {
      try {
        spinAmount = data.spinValue * evaluate(data.spinMath, {i: amount})
      }
      catch (err) {
        console.log("Error parsing spin function: " + err)
        spinAmount = 0
      }
    } else {
      const loopPeriod = numLoops / (parseInt(data.spinSwitchbacks) + 1)
      const stage = amount/loopPeriod
      const direction = (stage % 2 < 1 ? 1.0 : -1.0)
      spinAmount = direction * (amount % loopPeriod) * data.spinValue
      // Add in the amount it goes positive to the negatives, so they start at the same place.
      if (direction < 0.0) {
        spinAmount += loopPeriod * data.spinValue
      }
    }
    transformedVertex = rotate(transformedVertex, spinAmount)
  }

  if (data.repeatEnabled && data.trackEnabled) {
    transformedVertex = track(transformedVertex, data, trackIndex)
  }

  transformedVertex.rotateDeg(-data.rotation)
  transformedVertex.addX({x: data.offsetX || 0}).addY({y: data.offsetY || 0})

  return transformedVertex
}

function buildTrackLoop(vertices, transform, i, t) {
  const numLoops = transform.repeatEnabled ? transform.numLoops : 1
  const numTrackLoops = transform.repeatEnabled ? transform.trackNumLoops : 1
  const nextTrackVertex = transformShape(transform, vertices[0], 0, i + 1, numTrackLoops)
  const backtrack = numTrackLoops > 1 && t === numTrackLoops - 1
  let trackVertices = []
  let trackDistances = []
  const drawPortionPct = Math.round((transform.drawPortionPct || 100)/100.0 * vertices.length)
  const completion = (i === numLoops - 1 && t === numTrackLoops - 1) ? drawPortionPct : vertices.length

  for (var j=0; j<completion; j++) {
    const amount = transform.transformMethod === 'smear' ? i + t + j/vertices.length : i + t
    const trackVertex = transformShape(transform, vertices[j], amount, i, numTrackLoops)
    trackVertices.push(trackVertex)

    if (backtrack && completion === vertices.length) {
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
export const polishVertices = (vertices, machine, layerInfo) => {
  vertices = vertices.map(vertex => Victor.fromObject(vertex))

  if (vertices.length > 0) {
    const machineInstance = getMachineInstance(vertices, machine, layerInfo)
    vertices = machineInstance.polish().vertices
  }

  return vertices
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

export const transformShapes = (vertices, transform) => {
  const startTime = performance.now()
  const numLoops = transform.repeatEnabled ? transform.numLoops : 1
  const numTrackLoops = transform.repeatEnabled ? transform.trackNumLoops : 1
  let outputVertices = []

  if (transform.canChangeSize) {
    vertices = vertices.map(vertex => {
      return scale(vertex, 100.0 * transform.startingSize)
    })
  }

  if (transform.transformMethod === 'smear' && transform.repeatEnabled) {
    // remove last vertex; we don't want to return to our starting point when completing the shape
    vertices.pop()
  }

  if (transform.rotateStartingPct === undefined || transform.rotateStartingPct !== 0) {
    const start = Math.round(vertices.length * transform.rotateStartingPct / 100.0)
    vertices = arrayRotate(vertices, start)

    // some patterns create a loop when drawn and transformMethod is 'intact'; in
    // this case, rotateStartingPct will not draw the final vertex to complete the
    // loop. Use rotateCompleteLoop to add it back in for specific shapes.
    if (transform.rotateCompleteLoop) {
      vertices.push(new Victor(vertices[0].x, vertices[0].y))
    }
  }

  if (transform.trackEnabled && numTrackLoops > 1) {
    for (var i=0; i<numLoops; i++) {
      for (var t=0; t<numTrackLoops; t++) {
        outputVertices = outputVertices.concat(buildTrackLoop(vertices, transform, i, t))
      }
    }
  } else {
    for (i=0; i<numLoops; i++) {
      const drawPortionPct = Math.round((transform.drawPortionPct || 100)/100.0 * vertices.length)
      const completion = i === numLoops - 1 ? drawPortionPct : vertices.length

      for (var j=0; j<completion; j++) {
        let amount = transform.transformMethod === 'smear' ? i + j/vertices.length : i
        outputVertices.push(transformShape(transform, vertices[j], amount, amount))
      }
    }
  }

  if (transform.backtrackPct) {
    const backtrack = Math.round(vertices.length * transform.backtrackPct / 100.0)
    outputVertices = outputVertices.concat(outputVertices.slice(outputVertices.length - backtrack).reverse())
  }

  if (transform.reverse) {
    outputVertices = outputVertices.reverse()
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
