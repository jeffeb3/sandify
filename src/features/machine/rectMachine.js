import Victor from 'victor'
import { coterminal, angle, onSegment, slope } from '../../common/Geometry'
import { roundP } from '../../common/util'

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

  const intersection = lineStart.clone().add(line.clone().multiply(new Victor(t, t)))
  return intersection
}

export default class RectMachine {
  // vertices should be a Victor array
  constructor(vertices, settings) {
    this.vertices = vertices
    this.settings = settings
    this.sizeX = Math.abs((settings.maxX - settings.minX) / 2.0)
    this.sizeY = Math.abs((settings.maxY - settings.minY) / 2.0)
  }

  // manipulates the points to make them all in bounds, while doing the least
  // amount of damage to the desired shape.
  polish() {
    return this.addEndpoints()
      .clipAlongPerimeter()
      .cleanVertices()
      .optimizePerimeter()
  }

  addEndpoints() {
    if (this.settings.rectOrigin.length === 1) {
      // OK, let's assign corners indices:
      //
      // [1]   [2]
      //
      //
      // [0]   [3]
      const dx = (this.settings.maxX - this.settings.minX) / 2.0
      const dy = (this.settings.maxY - this.settings.minY) / 2.0
      const corners = [
        {x: -dx, y: -dy},
        {x: -dx, y:  dy},
        {x:  dx, y:  dy},
        {x:  dx, y: -dy}
      ]

      let first = this.vertices[0]
      let last = this.vertices[this.vertices.length-1]
      let maxRadius = Math.sqrt(Math.pow(2.0*dx,2.0) + Math.pow(2.0*dy, 2.0)) / 2.0
      let outPoint
      let newVertices = []

      if (first.magnitude() <= last.magnitude()) {
        // It's going outward
        let scale = maxRadius / last.magnitude()
        outPoint = Victor.fromObject(last).multiply(new Victor(scale, scale))
        newVertices.push(Victor.fromObject({...last, x: outPoint.x, y: outPoint.y}))
      } else {
        let scale = maxRadius / first.magnitude()
        outPoint = Victor.fromObject(first).multiply(new Victor(scale, scale))
        newVertices.push(Victor.fromObject({...first, x: outPoint.x, y: outPoint.y}))
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

      while (nextCorner !== this.settings.rectOrigin[0]) {
        newVertices.push(Victor.fromObject({...first, x: corners[nextCorner].x, y: corners[nextCorner].y}))
        nextCorner -= 1
        if (nextCorner < 0) {
          nextCorner = 3
        }
      }

      newVertices.push(Victor.fromObject({...first, x: corners[nextCorner].x, y: corners[nextCorner].y}))

      if (first.magnitude() <= last.magnitude()) {
        // outward
        this.vertices = this.vertices.concat(newVertices)
      } else {
        this.vertices = newVertices.reverse().concat(this.vertices)
      }
    }

    return this
  }

  clipAlongPerimeter() {
    let cleanVertices = []
    let previous = null

    for (let next=0; next<this.vertices.length; next++) {
      const vertex = this.vertices[next]

      if (previous) {
        const line = this.clipLine(previous, vertex)

        for (let pt=0; pt<line.length; pt++) {
          if (line[pt] !== previous) {
            cleanVertices.push(line[pt])
          }
        }
      } else {
        cleanVertices.push(this.nearestVertex(vertex))
      }
      previous = vertex
    }

    this.vertices = cleanVertices
    return this
  }

  // Just for sanity, and cases that I haven't thought of, clean this list again, including removing
  // duplicate points
  cleanVertices() {
    let previous = null
    let cleanVertices = []

    for (let i=0; i<this.vertices.length; i++) {
      if (previous) {
        let start = this.vertices[i]
        let end = previous

        if (start.distance(end) > 0.001) {
          cleanVertices.push(this.nearestVertex(this.vertices[i]))
        }
      } else {
        cleanVertices.push(this.nearestVertex(this.vertices[i]))
      }
      previous = this.vertices[i]
    }

    this.vertices = cleanVertices
    return this
  }

  // Removes unnecessary extra loops
  optimizePerimeter() {
    let segment = {vertices: [], corners: {}, loop: {}}

    for (let i=0; i<this.vertices.length; i++) {
      const curr = this.vertices[i]
      const prev = this.vertices[i-1]

      // calculate line slope, but allow for imprecision
      const s = i === 0 ? 0 : slope(
        {x: roundP(curr.x, 5), y: roundP(curr.y, 5)},
        {x: roundP(prev.x, 5), y: roundP(prev.y, 5)}
      )

      // if we're not on an edge, we should reset our loop counting
      if (s !== undefined && s !== 0) {
        segment.corners = {}
        segment.loop = {}
      }

      if (segment.vertices.length === 0) {
        segment.vertices = [curr]
      } else if (this.onCorner(curr)) {
        let key = curr.x + '-' + curr.y
        let found = segment.corners[key]

        if (found) {
          // this is a second loop; roll back
          found = segment.loop[key]
          if (found) {
            segment.vertices = segment.vertices.slice(0, found + 1)
            Object.keys(segment.loop).forEach(ckey => {
              if (ckey !== key && segment.loop[ckey] && segment.loop[ckey] > found) {
                segment.loop[ckey] = null
              }
            })
          } else {
            // note that we've looped once
            segment.vertices.push(curr)
            segment.loop[key] = segment.vertices.length - 1
          }
        } else {
          segment.vertices.push(curr)
          segment.corners[key] = segment.vertices.length - 1
        }
      } else {
        segment.vertices.push(curr)
      }
    }

    this.vertices = segment.vertices
    return this
  }

  // whether a given vertex is inside the boundaries of the rect
  onPerimeter(vertex, delta=.00001) {
    const dx = Math.abs(Math.abs(vertex.x) - this.sizeX)
    const dy = Math.abs(Math.abs(vertex.y) - this.sizeY)
    return dx < delta || dy < delta
  }

  onCorner(vertex, delta=.00001) {
    const dx = Math.abs(Math.abs(vertex.x) - this.sizeX)
    const dy = Math.abs(Math.abs(vertex.y) - this.sizeY)
    return dx < delta && dy < delta
  }

  isCornerEdge(v1, v2) {
    return (this.onCorner(v1) && this.onPerimeter(v2)) || (this.onCorner(v2) && this.onPerimeter(v1))
  }

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
  pointLocation(point) {
    let location = 0b0

    if (point.x < -this.sizeX) {
      location += 0b1000
    } else if (point.x > this.sizeX) {
      location += 0b0100
    }

    if (point.y < -this.sizeY) {
      location += 0b0001
    } else if (point.y > this.sizeY) {
      location += 0b0010
    }

    return location
  }

  // This method is the guts of logic for this limits enforcer. It will take a single line (defined by
  // start and end) and if the line goes out of bounds, returns the vertices around the outside edge
  // to follow around without messing up the shape of the vertices.
  //
  clipLine(lineStart, lineEnd) {
    var quadrantStart = this.pointLocation(lineStart)
    var quadrantEnd = this.pointLocation(lineEnd)

    if (quadrantStart === 0b0000 && quadrantEnd === 0b0000) {
      // The line is inside the boundaries
      return [lineStart, lineEnd]
    }

    if (quadrantStart === quadrantEnd) {
      // We are in the same box, and we are out of bounds.
      return [this.nearestVertex(lineStart), this.nearestVertex(lineEnd)]
    }

    if (quadrantStart & quadrantEnd) {
      // These points are all on one side of the box.
      return [this.nearestVertex(lineStart), this.nearestVertex(lineEnd)]
    }

    if (quadrantStart === 0b000) {
      // We are exiting the box. Return the start, the intersection with the boundary, and the closest
      // boundary point to the exited point.
      var line = [lineStart]
      line.push(this.boundPoint(lineStart, lineEnd))
      line.push(this.nearestVertex(lineEnd))
      return line
    }

    if (quadrantEnd === 0b000) {
      // We are re-entering the box.
      return [this.boundPoint(lineEnd, lineStart), lineEnd]
    }

    // We have reached a terrible place, where both points are oob, but it might intersect with the
    // work area. First, define the boundaries as lines.
    const sides = [
      // left
      [Victor(-this.sizeX, -this.sizeY), new Victor(-this.sizeX, this.sizeY)],
      // right
      [new Victor(this.sizeX, -this.sizeY), new Victor(this.sizeX, this.sizeY)],
      // bottom
      [new Victor(-this.sizeX, -this.sizeY), new Victor(this.sizeX, -this.sizeY)],
      // top
      [new Victor(-this.sizeX, this.sizeY), new Victor(this.sizeX, this.sizeY)],
    ]

    // Count up the number of boundary lines intersect with our line segment.
    var intersections = []
    for (var s=0; s<sides.length; s++) {
      var intPoint = intersection(lineStart,
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
      if (Victor.fromObject(intersections[0]).subtract(lineStart).lengthSq() >
          Victor.fromObject(intersections[1]).subtract(lineStart).lengthSq()) {
        var temp = intersections[0]
        intersections[0] = intersections[1]
        intersections[1] = temp
      }

      return [...intersections, this.nearestVertex(lineEnd)]
    }

    // Damn. We got here because we have a start and end that are failing different boundary checks,
    // and the line segment doesn't intersect the box. We have to crawl around the outside of the
    // box until we reach the other point.
    // Here, I'm going to split this line into two parts, and send each half line segment back
    // through the clipLine algorithm. Eventually, that should result in only one of the other cases.
    var midpoint = Victor.fromObject(lineStart).add(lineEnd).multiply(new Victor(0.5, 0.5))

    // recurse, and find smaller segments until we don't end up in this place again.
    return [...this.clipLine(lineStart, midpoint),
            ...this.clipLine(midpoint, lineEnd)]
  }

  // Intersect the line with the boundary, and return the point exactly on the boundary.
  // This will keep the shape. i.e. It will follow the line segment, and return the point on that line
  // segment.
  boundPoint(good, bad) {
    const dx = good.x - bad.x
    const dy = good.y - bad.y
    const fixed = new Victor(bad.x, bad.y)
    let distance = 0

    if (bad.x < -this.sizeX || bad.x > this.sizeX) {
      if (bad.x < -this.sizeX) {
        // we are leaving the left
        fixed.x = -this.sizeX
      } else {
        // we are leaving the right
        fixed.x = this.sizeX
      }

      distance = (fixed.x - good.x) / dx
      fixed.y = good.y + distance * dy

      // We fixed x, but y might have the same problem, so we'll rerun this, with different points.
      return this.boundPoint(good, fixed)
    }

    if (bad.y < -this.sizeY || bad.y > this.sizeY) {
      if (bad.y < -this.sizeY) {
        // we are leaving the bottom
        fixed.y = -this.sizeY
      } else {
        // we are leaving the top
        fixed.y = this.sizeY
      }

      distance = (fixed.y - good.y) / dy
      fixed.x = good.x + distance * dx
    }

    return fixed
  }

  // Finds the nearest vertex that is in the bounds. This will change the shape. i.e. this doesn't
  // care about the line segment, only about the point.
  nearestVertex(vertex) {
    return new Victor(Math.min(this.sizeX, Math.max(-this.sizeX, vertex.x)),
                  Math.min(this.sizeY, Math.max(-this.sizeY, vertex.y)))
  }
}
