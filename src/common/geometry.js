import Victor from "victor"
import { roundP } from "./util"

// convert degrees to radians
export const degToRad = (deg) => {
  return (deg / 180.0) * Math.PI
}

// convert radians to degrees
export const radToDeg = (rad) => {
  return (rad * 180.0) / Math.PI
}

// snap a value to the nearest grid point
export const snapToGrid = (value, tolerance) => {
  return Math.round(value / tolerance) * tolerance
}

// Using x*x instead of Math.pow(x, 2) avoids function call overhead (~10-20x
// faster for squaring).
export const magnitude = (x, y) => Math.sqrt(x * x + y * y)

export const distance = (v1, v2) => magnitude(v1.x - v2.x, v1.y - v2.y)

// Calculate the centroid (geometric center) of a set of vertices.
// Excludes duplicate closing vertex if present (would skew the average).
// https://en.wikipedia.org/wiki/Centroid
export const centroid = (vertices) => {
  if (vertices.length === 0) return { x: 0, y: 0 }

  let len = vertices.length

  // Exclude closing vertex if it duplicates the first
  if (len > 1) {
    const first = vertices[0]
    const last = vertices[len - 1]
    const tolerance = 0.1

    if (
      Math.abs(first.x - last.x) < tolerance &&
      Math.abs(first.y - last.y) < tolerance
    ) {
      len--
    }
  }

  let cx = 0
  let cy = 0

  for (let i = 0; i < len; i++) {
    cx += vertices[i].x
    cy += vertices[i].y
  }

  return { x: cx / len, y: cy / len }
}

export const totalDistance = (vertices) => {
  let d = 0.0
  let previous = null

  vertices.forEach((vertex) => {
    if (previous && vertex) {
      d += distance(previous, vertex)
    }
    previous = vertex
  })

  return d
}

// returns the total distance calculated for every vertex by index; also returns
// total distance
export const totalDistances = (vertices) => {
  let total = 0.0
  let previous = null
  const distances = { 0: 0.0 }

  vertices.forEach((vertex, index) => {
    if (previous && vertex) {
      total += distance(previous, vertex)
      distances[index] = total
    }
    previous = vertex
  })

  return { total, distances }
}

// returns the points whose cumulative length most closely match the target length
export const boundingVerticesAtLength = (vertices, targetLength) => {
  let cumulativeLength = 0

  for (let i = 0; i < vertices.length - 1; i++) {
    let dx = vertices[i + 1].x - vertices[i].x
    let dy = vertices[i + 1].y - vertices[i].y
    let segmentLength = Math.sqrt(dx * dx + dy * dy)

    if (cumulativeLength + segmentLength >= targetLength) {
      return [vertices[i], vertices[i + 1]]
    }
    cumulativeLength += segmentLength
  }

  // If target length is beyond the vertices, return the last two vertices
  return [vertices[vertices.length - 2], vertices[vertices.length - 1]]
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
  return (
    start.distance(point) + end.distance(point) - start.distance(end) < 0.001
  )
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

  for (let i = 1; i < n; ++i) {
    let p = vertices[i]
    loX = Math.min(loX, p.x)
    hiX = Math.max(hiX, p.x)
    loY = Math.min(loY, p.y)
    hiY = Math.max(hiY, p.y)
  }

  return [new Victor(loX, loY), new Victor(hiX, hiY)]
}

export const dimensions = (vertices, precision = 0) => {
  const bounds = findBounds(vertices)

  if (bounds.length === 0) {
    return {
      width: 0,
      height: 0,
    }
  } else if (precision !== false) {
    return {
      width: Math.round(bounds[1].x - bounds[0].x, precision),
      height: Math.round(bounds[1].y - bounds[0].y, precision),
    }
  } else {
    return {
      width: bounds[1].x - bounds[0].x,
      height: bounds[1].y - bounds[0].y,
    }
  }
}

// resizes each vertex in a list to the specified dimensions; the stretch parameter determines
// whether to stretch the shape to fit the dimensions.
export const resizeVertices = (
  vertices,
  sizeX,
  sizeY,
  stretch = false,
  aspectRatio = 1.0,
) => {
  if (vertices.length < 2) return vertices

  let scaleX, scaleY, deltaX, deltaY
  const bounds = findBounds(vertices)
  const oldSizeX = bounds[1].x - bounds[0].x
  const oldSizeY = bounds[1].y - bounds[0].y

  if (stretch) {
    scaleX = sizeX / oldSizeX
    scaleY = sizeY / oldSizeY
    deltaX = 0
    deltaY = 0
  } else {
    const size = Math.max(sizeX, sizeY)
    const oldSize = Math.max(oldSizeX, oldSizeY)

    if (aspectRatio > 1) {
      scaleX = size / oldSize
      scaleY = size / aspectRatio / oldSize
    } else {
      scaleX = (size * aspectRatio) / oldSize
      scaleY = size / oldSize
    }
    bounds[0].multiply({ x: scaleX, y: scaleY })
    bounds[1].multiply({ x: scaleX, y: scaleY })
    deltaX = bounds[0].x / 2
    deltaY = bounds[0].y / 2
  }

  vertices.forEach((vertex) => {
    vertex.multiply({ x: scaleX, y: scaleY }).add({ x: -deltaX, y: -deltaY })
  })

  return vertices
}

// modifies a vertex's x and y rounded to p number of digits
export const vertexRoundP = (vertex, p) => {
  vertex.x = roundP(vertex.x, p)
  vertex.y = roundP(vertex.y, p)

  return vertex
}

// Transform functions
export const rotate = (vertex, angleDeg) => {
  vertex.rotateDeg(angleDeg)

  return vertex
}

export const scale = (vertex, scaleX, scaleY) => {
  vertex.multiply({ x: scaleX, y: scaleY === undefined ? scaleX : scaleY })

  return vertex
}

export const offset = (vertex, x, y) => {
  vertex.add({ x, y })

  return vertex
}

// Transform vertex to local space (offset then rotate)
export const toLocalSpace = (vertex, x, y, rotation) => {
  return rotate(offset(vertex, -x, -y), rotation)
}

// Transform vertex back to world space (rotate back then offset)
export const toWorldSpace = (vertex, x, y, rotation) => {
  return offset(rotate(vertex, -rotation), x, y)
}

// applies a DOMMatrix (or object with a,b,c,d,e,f) to a vertex
// | a c e |   | x |   | a*x + c*y + e |
// | b d f | × | y | = | b*x + d*y + f |
export const applyMatrix = (vertex, matrix) => {
  const { a, b, c, d, e, f } = matrix
  const newX = a * vertex.x + c * vertex.y + e
  const newY = b * vertex.x + d * vertex.y + f

  vertex.x = newX
  vertex.y = newY

  return vertex
}

// applies a matrix to an array of vertices
export const applyMatrixToVertices = (vertices, matrix) => {
  vertices.forEach((vertex) => applyMatrix(vertex, matrix))

  return vertices
}

// modifies the given array in place, centering the points on (0, 0)
export const centerOnOrigin = (vertices, bounds) => {
  if (vertices.length === 0) return vertices

  bounds ||= findBounds(vertices)
  const offsetX = (bounds[1].x + bounds[0].x) / 2
  const offsetY = (bounds[1].y + bounds[0].y) / 2

  vertices.forEach((v) => v.add(new Victor(-offsetX, -offsetY)))
  return vertices
}

export const shiftToFirstQuadrant = (vertices) => {
  let minX = Infinity
  let minY = Infinity

  vertices.forEach((vertex) => {
    const { x, y } = vertex

    if (x < minX) {
      minX = x
    }
    if (y < minY) {
      minY = y
    }
  })

  return vertices.map((vertex) => {
    return vertex.subtract(new Victor(minX, minY))
  })
}

const hAlignRight = (bounds) => -bounds[1].x
const hAlignLeft = (bounds) => 0 - bounds[0].x
const hAlignCenter = (bounds) => -(bounds[1].x - bounds[0].x) / 2

// aligns a group of selections, modifying vertices in place
export const horizontalAlign = (selections, align = "left") => {
  const dFn =
    align === "center"
      ? hAlignCenter
      : align === "left"
        ? hAlignLeft
        : hAlignRight
  const allBounds = findBounds(selections.flat())
  const dAll = dFn(allBounds)

  selections.forEach((selection) => {
    const bounds = findBounds(selection)
    const d = dFn(bounds)

    selection.forEach((vertex) => {
      vertex.add(new Victor(-dAll + d, 0))
    })
  })

  return selections
}

// returns an array of points drawing a circle of a given radius
export const circle = (radius, start = 0, x = 0, y = 0, resolution = 128.0) => {
  let points = []

  for (let i = 0; i <= resolution; i++) {
    let angle = ((Math.PI * 2.0) / resolution) * i + start
    points.push(
      new Victor(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius),
    )
  }

  return points
}

// returns an array of points drawing an ellipse with given radii
export const ellipse = (rx, ry, cx = 0, cy = 0, resolution = 128.0) => {
  return ellipticalArc(rx, ry, 0, Math.PI * 2, cx, cy, resolution / 4)
}

// returns an array of points drawing an elliptical arc
export const ellipticalArc = (
  rx,
  ry,
  startAngle,
  endAngle,
  cx = 0,
  cy = 0,
  resolution = 16,
) => {
  const steps = Math.max(
    4,
    Math.ceil((resolution * Math.abs(endAngle - startAngle)) / (Math.PI / 2)),
  )
  const points = []

  for (let i = 0; i <= steps; i++) {
    const angle = startAngle + ((endAngle - startAngle) * i) / steps
    points.push(
      new Victor(cx + Math.cos(angle) * rx, cy + Math.sin(angle) * ry),
    )
  }

  return points
}

export const arc = (
  radius,
  startAngle,
  endAngle,
  x = 0,
  y = 0,
  shortestDistance = true,
) => {
  let resolution = (Math.PI * 2.0) / 128.0 // 128 segments per circle. Enough?
  let deltaAngle = (endAngle - startAngle + 2.0 * Math.PI) % (2.0 * Math.PI)

  if (shortestDistance) {
    if (deltaAngle > Math.PI) {
      deltaAngle -= 2.0 * Math.PI
    }

    if (deltaAngle < 0.0) {
      resolution *= -1.0
    }
  }

  let tracePoints = []
  for (let step = 0; step < deltaAngle / resolution; step++) {
    tracePoints.push(
      Victor(
        x + radius * Math.cos(resolution * step + startAngle),
        y + radius * Math.sin(resolution * step + startAngle),
      ),
    )
  }
  return tracePoints
}

// Subsample lines into smaller line segments
export const subsample = (vertices, maxLength) => {
  let subsampledVertices = []
  let previous = undefined
  let next
  const maxSegments = 1000

  for (next = 0; next < vertices.length; next++) {
    if (previous !== undefined) {
      const start = cloneVertex(vertices[previous])
      const end = cloneVertex(vertices[next])

      const delta = end.clone().subtract(start)
      const deltaSegment = end
        .clone()
        .subtract(start)
        .normalize()
        .multiply(Victor(maxLength, maxLength))

      // This loads up (start, end].
      const magnitude = delta.magnitude()

      // If the magnitude is unreasonably large, cap the number of segments
      // to prevent the creation of too many points
      const segmentMaxLength = Math.max(magnitude / maxSegments, maxLength)

      for (let step = 0; step < magnitude / segmentMaxLength; step++) {
        subsampledVertices.push(
          new Victor(
            start.x + step * deltaSegment.x,
            start.y + step * deltaSegment.y,
          ),
        )
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

export const downsample = (vertices, tolerance = 0.0001) => {
  if (vertices.length < 3) {
    return vertices
  }

  let result = [vertices[0]]

  for (let i = 1; i < vertices.length - 1; i++) {
    const v = vertices[i]
    const vn = vertices[i + 1]
    const vp = vertices[i - 1]
    const slope1 = (v.y - vp.y) / (v.x - vp.x)
    const slope2 = (vn.y - v.y) / (vn.x - v.x)

    const dy1 = Math.sign(v.y - vp.y)
    const dy2 = Math.sign(vn.y - v.y)
    const dx1 = Math.sign(v.x - vp.x)
    const dx2 = Math.sign(vn.x - v.x)

    if (dy1 != dy2 || dx1 != dx2 || Math.abs(slope1 - slope2) > tolerance) {
      result.push(vertices[i])
    }
  }

  result.push(vertices[vertices.length - 1])

  return result
}

// Convert x,y vertices to theta, rho vertices
export const toThetaRho = (
  subsampledVertices,
  maxRadius,
  rhoMax,
  previousTheta = 0,
  previousRawTheta = 0,
) => {
  let vertices = []

  // Normalize the radius
  if (rhoMax < 0) {
    rhoMax = 0.1
  }
  if (rhoMax > 1) {
    rhoMax = 1.0
  }

  for (let next = 0; next < subsampledVertices.length; ++next) {
    let rho =
      (cloneVertex(subsampledVertices[next]).magnitude() / maxRadius) * rhoMax
    rho = Math.min(rho, rhoMax)

    // What is the basic theta for this point?
    let rawTheta = Math.atan2(
      subsampledVertices[next].x,
      subsampledVertices[next].y,
    )

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

    const vertex = new Victor(theta, rho)

    // small hack to preserve these values
    vertex.theta = theta
    vertex.rawTheta = rawTheta

    vertices.push(vertex)
  }

  return vertices
}

export const maxY = (vertices) => {
  return Math.max(...vertices.map((v) => v.y))
}

export const minY = (vertices) => {
  return Math.min(...vertices.map((v) => v.y))
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

export const isLoop = (vertices, precision = 3) => {
  return (
    vertices.length > 1 &&
    vertexRoundP(vertices[0], precision).isEqualTo(
      vertexRoundP(vertices[vertices.length - 1], precision),
    )
  )
}

// Convert theta, rho vertices to goofy x, y, which really represent scara angles.
export const toScaraGcode = (vertices, unitsPerCircle) => {
  return vertices.map((thetaRho) => {
    const theta = thetaRho.x
    const rho = thetaRho.y
    const m1 = theta + Math.acos(rho)
    const m2 = theta - Math.acos(rho)
    const x = (unitsPerCircle * m1) / (2 * Math.PI)
    const y = (unitsPerCircle * m2) / (2 * Math.PI)

    // propagate theta if it exists
    const vertex = new Victor(x, y)

    if (thetaRho.theta) {
      vertex.theta = thetaRho.theta
      vertex.rawTheta = thetaRho.rawTheta
    }

    return vertex
  })
}

export const cloneVertex = (vertex) => {
  const newVertex = new Victor(vertex.x, vertex.y)
  const attrs = ["origX", "origY", "connect", "connector", "hidden"]

  attrs.forEach((attr) => {
    if (vertex[attr] !== undefined) {
      newVertex[attr] = vertex[attr]
    }
  })

  return newVertex
}

export const cloneVertices = (vertices) => {
  return vertices.map((vertex) => cloneVertex(vertex))
}

// add attributes to a given vertex
export const annotateVertex = (vertex, attrs) => {
  const filteredAttrs = Object.keys(attrs).reduce((memo, key) => {
    if (attrs[key] !== undefined) {
      memo[key] = attrs[key]
    }
    return memo
  }, {})

  Object.assign(vertex, filteredAttrs)

  return vertex
}

export const concatClonedVertices = (arr, vertices) => {
  vertices.forEach((vertex) => arr.push(cloneVertex(vertex)))
}

// add attributes to a given array of vertices
export const annotateVertices = (vertices, attrs) => {
  vertices.forEach((vertex) => {
    annotateVertex(vertex, attrs)
  })

  return vertices
}

// Check if 4 points are approximately collinear
const areCollinear = (p0, p1, p2, p3, tolerance = 0.01) => {
  const dx = p3.x - p0.x
  const dy = p3.y - p0.y
  const len = Math.sqrt(dx * dx + dy * dy)

  if (len < tolerance) return true

  // Distance from p1 and p2 to the line through p0-p3
  const dist1 = Math.abs(dx * (p0.y - p1.y) - dy * (p0.x - p1.x)) / len
  const dist2 = Math.abs(dx * (p0.y - p2.y) - dy * (p0.x - p2.x)) / len

  return dist1 < tolerance && dist2 < tolerance
}

// Attempt to subdivide a path using Catmull-Rom spline interpolation
// Returns subdivided points that pass through all original points with smooth curves
// Preserves straight segments when points are collinear
export const catmullRomSpline = (points, segmentsPerCurve = 8) => {
  if (points.length < 2) return points
  if (points.length === 2) return points

  const result = []

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(points.length - 1, i + 2)]

    result.push(p1)

    // Skip interpolation for collinear segments (keep straight lines straight)
    if (areCollinear(p0, p1, p2, p3)) {
      continue
    }

    for (let t = 1; t < segmentsPerCurve; t++) {
      const s = t / segmentsPerCurve
      const s2 = s * s
      const s3 = s2 * s

      result.push({
        x:
          0.5 *
          (2 * p1.x +
            (-p0.x + p2.x) * s +
            (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * s2 +
            (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * s3),
        y:
          0.5 *
          (2 * p1.y +
            (-p0.y + p2.y) * s +
            (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * s2 +
            (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * s3),
      })
    }
  }

  result.push(points[points.length - 1])

  return result
}

// returns the intersection point of two line segments
export const calculateIntersection = (p1, p2, p3, p4) => {
  var denominator =
    (p2.x - p1.x) * (p4.y - p3.y) - (p2.y - p1.y) * (p4.x - p3.x)
  if (denominator === 0) {
    return null // lines are parallel
  }
  var a = p1.y - p3.y
  var b = p1.x - p3.x
  var numerator1 = (p4.x - p3.x) * a - (p4.y - p3.y) * b
  var numerator2 = (p2.x - p1.x) * a - (p2.y - p1.y) * b
  a = numerator1 / denominator
  b = numerator2 / denominator

  // return the intersection point if it's within the bounds of both line segments
  if (a > 0 && a < 1 && b > 0 && b < 1) {
    return {
      x: p1.x + a * (p2.x - p1.x),
      y: p1.y + a * (p2.y - p1.y),
    }
  }
  return null // intersection point is out of bounds
}

// Point-in-polygon test using ray casting (even-odd rule)
// Returns true if point (px, py) is inside the polygon defined by ring
// ring can be an array of [x, y] coordinate pairs OR objects with {x, y} properties
export const pointInPolygon = (px, py, ring) => {
  if (ring.length === 0) return false

  const isArray = Array.isArray(ring[0])
  let inside = false

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = isArray ? ring[i][0] : ring[i].x
    const yi = isArray ? ring[i][1] : ring[i].y
    const xj = isArray ? ring[j][0] : ring[j].x
    const yj = isArray ? ring[j][1] : ring[j].y

    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }

  return inside
}

// Project a point onto a line segment, returning the closest point on the segment
export const projectToSegment = (point, p1, p2) => {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  const lenSq = dx * dx + dy * dy

  if (lenSq < 1e-10) {
    return new Victor(p1.x, p1.y)
  }

  let t = ((point.x - p1.x) * dx + (point.y - p1.y) * dy) / lenSq
  t = Math.max(0, Math.min(1, t))

  return new Victor(p1.x + t * dx, p1.y + t * dy)
}

// Distance from a point to a line segment
export const distanceToSegment = (point, p1, p2) => {
  const projected = projectToSegment(point, p1, p2)
  return distance(point, projected)
}

// Calculate signed area of a polygon using the shoelace formula
// https://en.wikipedia.org/wiki/Shoelace_formula
// Positive = counter-clockwise, negative = clockwise
export const polygonArea = (vertices) => {
  let area = 0
  const n = vertices.length

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n

    area += vertices[i].x * vertices[j].y
    area -= vertices[j].x * vertices[i].y
  }

  return area / 2
}
