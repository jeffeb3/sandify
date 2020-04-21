import Victor from 'victor'

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
  let deltaX = size - sizeX - scaledBounds[1].x - scaledBounds[0].x - 1
  let deltaY = size - sizeY - scaledBounds[1].y - scaledBounds[0].y - 1

  return vertices.map(vertex => vertex.multiply({x: scale, y: scale}).add({x: deltaX/2, y: deltaY/2}))
}
