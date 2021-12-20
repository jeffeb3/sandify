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

export const scale = (vertex, pctX, pctY) => {
  const scaleX = pctX / 100.0
  if (pctY === undefined) pctY = pctX
  const scaleY = pctY / 100.0

  return new Victor(
    vertex.x * scaleX,
    vertex.y * scaleY
  )
}

export const offset = (vertex, offsetX, offsetY) => {
  return new Victor(
    vertex.x + offsetX,
    vertex.y + offsetY
  )
}

// modifies the given array in place, centering the points on (0, 0)
export const centerOnOrigin = (vertices, bounds) => {
  bounds ||= findBounds(vertices)
  const offsetX = (bounds[1].x + bounds[0].x) / 2
  const offsetY = (bounds[1].y + bounds[0].y) / 2

  vertices.forEach(v => v.add(new Victor(-offsetX, -offsetY)))
  return vertices
}

const hAlignRight = (bounds) => -bounds[1].x
const hAlignLeft = (bounds) => 0 - bounds[0].x
const hAlignCenter = (bounds) => -(bounds[1].x - bounds[0].x)/2

// aligns a group of selections, modifying vertices in place
export const horizontalAlign = (selections, align = 'left') => {
  const dFn = align === 'center' ?
    hAlignCenter :
    align ==='left' ? hAlignLeft : hAlignRight
  const allBounds = findBounds(selections.flat())
  const dAll = dFn(allBounds)

  selections.forEach(selection => {
    const bounds = findBounds(selection)
    const d = dFn(bounds)

    selection.forEach(vertex => {
      vertex.add(new Victor(- dAll + d, 0))
    })
  })
  return selections
}

// returns an array of points drawing a circle of a given radius
export const circle = (radius, start=0, x=0, y=0) => {
  let points = []

  for (let i=0; i<=128; i++) {
    let angle = Math.PI * 2.0 / 128.0 * i + start
    points.push(new Victor(x + Math.cos(angle)*radius, y + Math.sin(angle)*radius))
  }

  return points
}

export const arc = (radius, startAngle, endAngle, x=0, y=0) => {
  let resolution = (Math.PI*2.0) / 128.0 // 128 segments per circle. Enough?
  let deltaAngle = ((endAngle - startAngle) + 2.0 * Math.PI) % (2.0 * Math.PI)

  if (deltaAngle > Math.PI) {
    deltaAngle -= 2.0 * Math.PI
  }
  if (deltaAngle < 0.0) {
    resolution *= -1.0
  }

  let tracePoints = []
  for (let step = 0; step < (deltaAngle/resolution) ; step++) {
    tracePoints.push(Victor(x + radius * Math.cos(resolution * step + startAngle),
                            y + radius * Math.sin(resolution * step + startAngle)))
  }
  return tracePoints
}

// Subsample lines into smaller line segments
export const subsample = (vertices, maxLength) => {
  let subsampledVertices = []
  let previous = undefined
  let next

  for (next = 0; next < vertices.length; next++) {
    if (previous !== undefined) {
      const start = Victor.fromObject(vertices[previous])
      const end = Victor.fromObject(vertices[next])

      const delta = end.clone().subtract(start)
      const deltaSegment = end.clone().subtract(start).normalize().multiply(Victor(maxLength, maxLength))

      // This loads up (start, end].
      for (let step = 0; step < (delta.magnitude() / maxLength) ; step++) {
        subsampledVertices.push(
          new Victor(start.x + step * deltaSegment.x,
                     start.y + step * deltaSegment.y))
      }

    }
    previous = next
  }

  // Add in the end
  if (previous !== undefined) {
    subsampledVertices.push(vertices[vertices.length - 1])
  }

  return subsampledVertices
}

// Convert x,y vertices to theta, rho vertices
export const toThetaRho = (subsampledVertices, maxRadius, rhoMax) => {
  let vertices = []
  let previousTheta = 0
  let previousRawTheta = 0

  // Normalize the radius
  if (rhoMax < 0) { rhoMax = 0.1 }
  if ( rhoMax > 1) { rhoMax = 1.0 }

  for (let next = 0; next < subsampledVertices.length; ++next) {

    let rho = (Victor.fromObject(subsampledVertices[next]).magnitude() / maxRadius) * rhoMax
    rho = Math.min(rho, rhoMax)

    // What is the basic theta for this point?
    let rawTheta = Math.atan2(subsampledVertices[next].x,
                              subsampledVertices[next].y)
    // Convert to [0, 2pi]
    rawTheta = (rawTheta + 2.0 * Math.PI) % (2.0 * Math.PI)

    // Compute the difference to the last point.
    let deltaTheta = rawTheta - previousRawTheta

    // Convert to [-pi,pi]
    if (deltaTheta < -Math.PI) {
      deltaTheta += 2.0 * Math.PI
    }
    if (deltaTheta > Math.PI) {
      deltaTheta -= 2.0 * Math.PI
    }

    const theta = previousTheta + deltaTheta

    previousRawTheta = rawTheta
    previousTheta = theta
    vertices.push(new Victor(theta, rho))
  }

  return vertices
}

export const maxY = (vertices) => {
  return Math.max(...vertices.map(v => v.y))
}

export const minY = (vertices) => {
  return Math.min(...vertices.map(v => v.y))
}

// returns the index of the vertex in arr that is closest to the given vertex
export const nearestVertex = (vertex, arr) => {
  return findMinimumVertex(vertex, arr, distance)
}

// returns the index of a vertex in arr that matches most closely based on a given
// function. The lower the function value, the closer the match.
export const findMinimumVertex = (value, arr, fn) => {
  let dMin = Infinity
  let found = null

  arr.forEach((v, idx) => {
    const d = fn(value, v)
    if (d < dMin) {
      dMin = d
      found = idx
    }
  })

  return found
}

// Convert theta, rho vertices to goofy x, y, which really represent scara angles.
export const toScaraGcode = (vertices, unitsPerCircle) => {
  return vertices.map( thetaRho => {
    const theta = thetaRho.x
    const rho = thetaRho.y
    const m1 = theta + Math.acos(rho)
    const m2 = theta - Math.acos(rho)
    const x = unitsPerCircle * m1 / (2*Math.PI)
    const y = unitsPerCircle * m2 / (2*Math.PI)
    return new Victor(x,y)
  })
}
