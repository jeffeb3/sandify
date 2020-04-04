import Victor from 'victor'

// Determines which of 8 neighbor areas the point is in:
//   https://stackoverflow.com/questions/3746274/line-intersection-with-aabb-rectangle
//
//           |          |
//   0b1001  |  0b0001  |  0b0101
//           |          |
// ------------------------------ y_max
//           |          |
//   0b1000  |  0b0000  |  0b0100
//           |          |
// ------------------------------ y_min
//           |          |
//   0b1010  |  0b0010  |  0b0110
//           |          |
//         x_min      x_max
//
function pointLocation(point, sizeX, sizeY) {
  let location = 0b0
  if (point.x < -sizeX) {
    location += 0b1000
  } else if (point.x > sizeX) {
    location += 0b0100
  }

  if (point.y < -sizeY) {
    location += 0b0001
  } else if (point.y > sizeY) {
    location += 0b0010
  }

  return location
}

// Determine intersection with one of the sides
function intersection(lineStart, lineEnd, sideStart, sideEnd) {
  let line = lineEnd.clone().subtract(lineStart)
  let side = sideEnd.clone().subtract(sideStart)
  let lineCrossSidePerp = line.x * side.y - line.y * side.x

  // if line Cross side === 0, it means the lines are parallel so have infinite intersection points
  if (lineCrossSidePerp === 0) {
    return null
  }

  const diff = sideStart.clone().subtract(lineStart)
  let t = (diff.x * side.y - diff.y * side.x) / lineCrossSidePerp
  if (t < 0 || t >= 1) {
    return null
  }

  const u = (diff.x * line.y - diff.y * line.x) / lineCrossSidePerp
  if (u < 0 || u >= 1) {
    return null
  }

  const intersection = lineStart.clone().add(line.clone().multiply(Victor(t, t)))
  return intersection
}

// This method is the guts of logic for this limits enforcer. It will take a single line (defined by
// start and end) and if the line goes out of bounds, returns the vertices around the outside edge
// to follow around without messing up the shape of the vertices.
//
function clipLine(lineStart, lineEnd, sizeX, sizeY) {
  const quadrantStart = pointLocation(lineStart, sizeX, sizeY)
  const quadrantEnd = pointLocation(lineEnd, sizeX, sizeY)

  if (quadrantStart === 0b0000 && quadrantEnd === 0b0000) {
    // The line is inside the boundaries
    return [lineStart, lineEnd]
  }

  if (quadrantStart === quadrantEnd) {
    // We are in the same box, and we are out of bounds.
    return [nearestVertex(lineStart, sizeX, sizeY), nearestVertex(lineEnd, sizeX, sizeY)]
  }

  if (quadrantStart & quadrantEnd) {
    // These points are all on one side of the box.
    return [nearestVertex(lineStart, sizeX, sizeY), nearestVertex(lineEnd, sizeX, sizeY)]
  }

  if (quadrantStart === 0b000) {
    // We are exiting the box. Return the start, the intersection with the boundary, and the closest
    // boundary point to the exited point.
    let line = [lineStart]
    line.push(boundPoint(lineStart, lineEnd, sizeX, sizeY))
    line.push(nearestVertex(lineEnd, sizeX, sizeY))

    return line
  }

  if (quadrantEnd === 0b000) {
    // We are re-entering the box.
    return [boundPoint(lineEnd, lineStart, sizeX, sizeY), lineEnd]
  }

  // We have reached a terrible place, where both points are oob, but it might intersect with the
  // work area.

  // First, define the boundaries as lines.
  const sides = [
    // left
    [Victor(-sizeX, -sizeY), Victor(-sizeX, sizeY)],
    // right
    [Victor(sizeX, -sizeY), Victor(sizeX, sizeY)],
    // bottom
    [Victor(-sizeX, -sizeY), Victor(sizeX, -sizeY)],
    // top
    [Victor(-sizeX, sizeY), Victor(sizeX, sizeY)],
  ]

  // Count up the number of boundary lines intersect with our line segment.
  let intersections = []
  for (let s=0; s<sides.length; s++) {
    const intPoint = intersection(lineStart,
                                 lineEnd,
                                 sides[s][0],
                                 sides[s][1])
    if (intPoint) {
      intersections.push(new Victor(intPoint.x, intPoint.y))
    }
  }

  if (intersections.length !== 0) {
    if (intersections.length !== 2) {
      // We should never get here. How would we have something other than 2 or 0 intersections with
      // a box?
      console.log(intersections)
      throw Error("Software Geometry Error")
    }

    // The intersections are tested in some normal order, but the line could be going through them
    // in any direction. This check will flip the intersections if they are reversed somehow.
    if (intersections[0].subtract(lineStart).lengthSq() > intersections[1].subtract(lineStart).lengthSq()) {
      const temp = intersections[0]
      intersections[0] = intersections[1]
      intersections[1] = temp
    }
    return [...intersections, nearestVertex(lineEnd, sizeX, sizeY)]
  }

  // Damn. We got here because we have a start and end that are failing different boundary checks,
  // and the line segment doesn't intersect the box. We have to crawl around the outside of the
  // box until we reach the other point.
  //
  // Here, I'm going to split this line into two parts, and send each half line segment back
  // through the clipLine algorithm. Eventually, that should result in only one of the other cases.
  const midpoint = lineStart.add(lineEnd).multiply(new Victor(0.5, 0.5))

  // recurse, and find smaller segments until we don't end up in this place again.
  return [...clipLine(lineStart, midpoint, sizeX, sizeY),
          ...clipLine(midpoint, lineEnd, sizeX, sizeY)]
}

// Intersect the line with the boundary, and return the point exactly on the boundary.
// This will keep the shape. i.e. It will follow the line segment, and return the point on that line
// segment.
function boundPoint(good, bad, sizeX, sizeY) {
  const dx = good.x - bad.x
  const dy = good.y - bad.y
  const fixed = new Victor(bad.x, bad.y)
  let distance = 0

  if (bad.x < -sizeX || bad.x > sizeX) {
    if (bad.x < -sizeX) {
      // we are leaving the left
      fixed.x = -sizeX
    } else {
      // we are leaving the right
      fixed.x = sizeX
    }
    distance = (fixed.x - good.x) / dx
    fixed.y = good.y + distance * dy
    // We fixed x, but y might have the same problem, so we'll rerun this, with different points.
    return boundPoint(good, fixed, sizeX, sizeY)
  }
  if (bad.y < -sizeY || bad.y > sizeY) {
    if (bad.y < -sizeY) {
      // we are leaving the bottom
      fixed.y = -sizeY
    } else {
      // we are leaving the top
      fixed.y = sizeY
    }
    distance = (fixed.y - good.y) / dy
    fixed.x = good.x + distance * dx
  }
  return fixed
}

// Finds the nearest vertex that is in the bounds. This will change the shape. i.e. this doesn't
// care about the line segment, only about the point.
function nearestVertex(vertex, sizeX, sizeY) {
  return new Victor(Math.min(sizeX, Math.max(-sizeX, vertex.x)),
                Math.min(sizeY, Math.max(-sizeY, vertex.y)))
}

// Removes extra perimeter moves out of a given list of vertices, and returns
// an array of non-contiguous segments representing the valid perimeter
// vertices that are left.
const removeExtraPerimeterMoves = function(vertices, sizeX, sizeY) {
  let segments = []
  let segment = {vertices: []}
  let cutting = false
  let start, startAngle

  for (let i=0; i<vertices.length; i++) {
    const v = vertices[i]
    const dDelta = 15
  //const d = (i === 0) ? 1 : Math.abs(vertices[i-1].distance(v))
  }
}

function clipAlongPerimeter(vertices, sizeX, sizeY) {
  let cleanVertices = []
  let previous = null

  if (sizeX < 0) {
    sizeX *= -1.0
  }
  if (sizeY < 0) {
    sizeY *= -1.0
  }

  for (let next=0; next<vertices.length; next++) {
    const vertex = vertices[next]

    if (previous) {
      const line = clipLine(previous, vertex, sizeX, sizeY)

      for (let pt=0; pt<line.length; pt++) {
        if (line[pt] !== previous) {
          cleanVertices.push(line[pt])
        }
      }
    } else {
      cleanVertices.push(nearestVertex(vertex, sizeX, sizeY))
    }
    previous = vertex
  }

  return cleanVertices
}

// Just for sanity, and cases that I haven't thought of, clean this list again, including removing
// duplicate points
function cleanVertices(vertices, sizeX, sizeY) {
  let previous = null
  let cleanVertices = []

  for (let i=0; i<vertices.length; i++) {
    if (previous) {
      let start = vertices[i]
      let end = previous

      if (start.distance(end) > 0.001) {
        cleanVertices.push(nearestVertex(vertices[i], sizeX, sizeY))
      }
    } else {
      cleanVertices.push(nearestVertex(vertices[i], sizeX, sizeY))
    }
    previous = vertices[i]
  }

  return cleanVertices
}

// strip out unnecessary/redundant perimeter moves
function optimizePerimeter(vertices, sizeX, sizeY, minimizeMoves) {
  let segments = removeExtraPerimeterMoves(vertices, sizeX, sizeY)

  return vertices
}

function addRectEndpoints(vertices, settings) {
  // OK, let's assign corners indices:
  //
  // [1]   [2]
  //
  //
  // [0]   [3]
  const dx = (settings.maxX - settings.minX) / 2.0
  const dy = (settings.maxY - settings.minY) / 2.0
  const corners = [
    {x: -dx, y: -dy},
    {x: -dx, y:  dy},
    {x:  dx, y:  dy},
    {x:  dx, y: -dy}
  ]

  let first = vertices[0]
  let last = vertices[vertices.length-1]
  let maxRadius = Math.sqrt(Math.pow(2.0*dx,2.0) + Math.pow(2.0*dy, 2.0)) / 2.0
  let outPoint
  let newVertices = []

  if (first.magnitude() <= last.magnitude()) {
    // It's going outward
    let scale = maxRadius / last.magnitude()
    outPoint = last.multiply(Victor(scale,scale))
    newVertices.push({ ...last, x: outPoint.x, y: outPoint.y})
  } else {
    let scale = maxRadius / first.magnitude()
    outPoint = first.multiply(Victor(scale,scale))
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

  while (nextCorner !== settings.rectOrigin[0]) {
    newVertices.push({ ...first, x: corners[nextCorner].x, y: corners[nextCorner].y})
    nextCorner -= 1
    if (nextCorner < 0) {
      nextCorner = 3
    }
  }

  newVertices.push({ ...first, x: corners[nextCorner].x, y: corners[nextCorner].y})
  if (first.magnitude() <= last.magnitude()) {
    // outward
    vertices = vertices.concat(newVertices)
  } else {
    vertices = newVertices.reverse().concat(vertices)
  }

  return vertices
}

// Vertices should be a Victor array; manipulates the points to make them all in
// bounds, while doing the least amount of damage to the desired shape.
export const polishRectVertices = function(vertices, settings) {
  const sizeX = (settings.maxX - settings.minX)/2.0
  const sizeY = (settings.maxY - settings.minY)/2.0

  if (settings.rectOrigin.length === 1) {
    vertices = addRectEndpoints(vertices, settings)
  }

  vertices = clipAlongPerimeter(vertices, sizeX, sizeY)
  vertices = cleanVertices(vertices, sizeX, sizeY)
  vertices = optimizePerimeter(vertices, sizeX, sizeY, settings.minimizeMoves)

  return vertices
}
