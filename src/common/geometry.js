import Victor from 'victor'
import { roundP } from './util'

// convert degrees to radians
export const degToRad = (deg) => {
  return deg / 180.0 * Math.PI
}

// convert radians to degrees
export const radToDeg = (rad) => {
  return rad * 180.0 / Math.PI
}

export const distance = (v1, v2) => {
  return Math.sqrt(Math.pow(v1.x - v2.x, 2.0) + Math.pow(v1.y - v2.y, 2.0))
}

// calculate the coterminal angle (0..2*PI) of a given angle
export const coterminal = (angle) => {
  return angle - Math.floor(angle / (Math.PI * 2)) * Math.PI * 2
}

export const angle = (point) => {
  return Math.atan2(point.y, point.x)
}

// returns whether a point is on the segment defined by start and end
export const onSegment = (start, end, point) => {
  return start.distance(point) + end.distance(point) - start.distance(end) < 0.001
}

export const slope = (v1, v2) => {
  let d = v2.x - v1.x
  let n = v2.y - v1.y
  return d === 0 ? undefined : n / d
}

// computes a bounding box from a set of points.
export const findBounds = (vertices) => {
  let n = vertices.length

  if (n === 0) {
    return []
  }

  let loX = vertices[0].x
  let hiX = vertices[0].x
  let loY = vertices[0].y
  let hiY = vertices[0].y

  for(let i=1; i<n; ++i) {
    let p = vertices[i]
    loX = Math.min(loX, p.x)
    hiX = Math.max(hiX, p.x)
    loY = Math.min(loY, p.y)
    hiY = Math.max(hiY, p.y)
  }

  return [new Victor(loX, loY), new Victor(hiX, hiY)]
}

// resizes each vertex in a list to the specified dimensions. Will not stretch the shape.
export const resizeVertices = (vertices, sizeX, sizeY) => {
  let size = Math.max(sizeX, sizeY)
  let bounds = findBounds(vertices)
  let curveSize = Math.max(bounds[1].y - bounds[0].y, bounds[1].x - bounds[0].x)
  let scale = size/curveSize

  let scaledBounds = [bounds[0].multiply({x: scale, y: scale}), bounds[1].multiply({x: scale, y: scale})]
  let deltaX = scaledBounds[1].x - (scaledBounds[1].x - scaledBounds[0].x)/2
  let deltaY = scaledBounds[1].y - (scaledBounds[1].y - scaledBounds[0].y)/2

  return vertices.map(vertex => vertex.clone().multiply({x: scale, y: scale}).add({x: -deltaX, y: -deltaY}))
}

// returns a vertex with x and y rounded to p number of digits
export const vertexRoundP = (v, p) => {
  return new Victor(roundP(v.x, p), roundP(v.y, p))
}

// Transform functions
export const rotate = (vertex, angleDeg) => {
  const angle = Math.PI / 180.0 * angleDeg
  return new Victor(
   vertex.x * Math.cos(angle) - vertex.y * Math.sin(angle),
   vertex.x * Math.sin(angle) + vertex.y * Math.cos(angle)
  )
}

export const scale = (vertex, scalePerc) => {
  const scale = scalePerc / 100.0
  return new Victor(
    vertex.x * scale,
    vertex.y * scale
  )
}

export const offset = (vertex, offsetX, offsetY) => {
  return new Victor(
    vertex.x + offsetX,
    vertex.y + offsetY
  )
}

// given a set of vertices and a slider value, returns the indices of the
// start and end vertices representing a preview slider moving through them.
export const getSliderBounds = (vertices, sliderValue) => {
  const slideSize = 2.0
  const beginFraction = sliderValue / 100.0
  const endFraction = (slideSize + sliderValue) / 100.0
  let start = Math.round(vertices.length * beginFraction)
  let end = Math.round(vertices.length * endFraction) - 1

  if (start === end) {
    if (start > 1) start = start - 2
  } else if (start === end - 1) {
    if (start > 0) start = start - 1
  }

  if (end >= vertices.length) {
    end = vertices.length - 1
  }

  return { start: start, end: end }
}
