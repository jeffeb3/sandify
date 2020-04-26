import Victor from 'victor'
import Machine from './Machine'
import { distance } from '../../common/geometry'

export default class RectMachine extends Machine {
  constructor(vertices, settings) {
    super()
    this.vertices = vertices
    this.settings = settings
    this.sizeX = Math.abs((settings.maxX - settings.minX) / 2.0)
    this.sizeY = Math.abs((settings.maxY - settings.minY) / 2.0)
  }

  addEndpoints() {
    if (this.settings.rectOrigin.length === 1) {
      // OK, let's assign corners indices:
      // [1]   [2]
      //
      //
      // [0]   [3]
      const corner = this.settings.rectOrigin[0]
      const corners = [
        new Victor(-this.sizeX, -this.sizeY),
        new Victor(-this.sizeX, this.sizeY),
        new Victor(this.sizeX, this.sizeY),
        new Victor(this.sizeX, -this.sizeY)
      ]

      const first = this.vertices[0]
      const last = this.vertices[this.vertices.length-1]
      const maxRadius = Math.sqrt(Math.pow(2.0*this.sizeX, 2.0) + Math.pow(2.0*this.sizeY, 2.0)) / 2.0
      let scale, outPoint

      if (first.magnitude() <= last.magnitude()) {
        // It's going outward
        scale = maxRadius / last.magnitude()
        outPoint = last
      } else {
        scale = maxRadius / first.magnitude()
        outPoint = first
      }

      let clipped = this.clipLine(
        outPoint,
        Victor.fromObject(outPoint).multiply(new Victor(scale, scale))
      )
      const newPoint = clipped[clipped.length - 1]
      if (outPoint === last) {
        this.vertices = [this.vertices, this.tracePerimeter(newPoint, corners[corner], true)].flat()
      } else {
        this.vertices = [this.tracePerimeter(corners[corner], newPoint, true), this.vertices].flat()
      }
    }

    return this
  }

  // Returns the distance along the perimeter between two points
  perimeterDistance(v1, v2) {
    return this.distance(this.tracePerimeter(v1, v2, true))
  }

  // Returns whether a given path lies on the perimeter of the rectangle
  onPerimeter(v1, v2, delta=.0001) {
    const dx = Math.abs(Math.abs(v1.x) - this.sizeX)
    const dy = Math.abs(Math.abs(v1.y) - this.sizeY)

    return (v1.x === v2.x && dx < delta) || (v1.y === v2.y && dy < delta)
  }

  // Given two perimeter points, traces the shortest valid path between them (stays on
  // perimeter). Returns a list of intermediate points on that path (if any).
  // On further consideration, this could be redone using Dijsktra's algorithm, I believe,
  // but this works and is, I believe, reasonably efficient.
  tracePerimeter(p1, p2, includeOriginalPoints=false) {
    let points

    if ((p1.x === p2.x && Math.abs(p1.x) === this.sizeX) || (p1.y === p2.y && (Math.abs(p1.y) === this.sizeY))) {
      // on the same line; no connecting points needed
      points = []
    } else {
      // horizontal or vertical orientation
      let o1 = Math.abs(p1.x) === this.sizeX ? 'v' : 'h'
      let o2 = Math.abs(p2.x) === this.sizeX ? 'v' : 'h'

      if (o1 !== o2) {
        // connects via a single corner
        points = (o1 === 'h') ?
          [new Victor(p2.x, p1.y)] :
          [new Victor(p1.x, p2.y)]
      } else {
        // connects via two corners; find the shortest way around
        if (o1 === 'h') {
          let d1 = -2*this.sizeX - p1.x - p2.x
          let d2 = 2*this.sizeX - p1.x - p2.x
          let xSign = Math.abs(d1) > Math.abs(d2) ? 1 : -1

          points = [
            new Victor(Math.sign(xSign)*this.sizeX, Math.sign(p1.y)*this.sizeY),
            new Victor(Math.sign(xSign)*this.sizeX, -Math.sign(p1.y)*this.sizeY)
          ]
        } else {
          let d1 = -2*this.sizeY - p1.y - p2.y
          let d2 = 2*this.sizeY - p1.y - p2.y
          let ySign = Math.abs(d1) > Math.abs(d2) ? 1 : -1

          points = [
            new Victor(Math.sign(p1.x)*this.sizeX, Math.sign(ySign)*this.sizeY),
            new Victor(-Math.sign(p1.x)*this.sizeX, Math.sign(ySign)*this.sizeY),
          ]
        }
      }
    }

    if (includeOriginalPoints) {
      points.unshift(p1)
      points.push(p2)
    }

    return points
  }

  // Finds the nearest vertex that is in the bounds. This will change the shape. i.e. this
  // doesn't care about the line segment, only about the point.
  nearestVertex(vertex) {
    return new Victor(
      Math.min(this.sizeX, Math.max(-this.sizeX, vertex.x)),
      Math.min(this.sizeY, Math.max(-this.sizeY, vertex.y))
    )
  }

  // The guts of logic for this limits enforcer. It will take a single line (defined by
  // start and end) and if the line goes out of bounds, returns the vertices around the
  // outside edge to follow around without messing up the shape of the vertices.
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
      var intPoint = this.intersection(lineStart,
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

  // Returns the distance walked from the first vertex to the last vertex.
  distance(vertices) {
    let d = 0
    for(let i=0; i<vertices.length; i++) {
      if (i > 0) d = d + distance(vertices[i], vertices[i-1])
    }

    return d
  }

  // Determines which of 8 neighbor areas the point is in:
  //   https://stackoverflow.com/questions/3746274/line-intersection-with-aabb-rectangle
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

  // Determines intersection with one of the sides.
  intersection(lineStart, lineEnd, sideStart, sideEnd) {
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

    return lineStart.clone().add(line.clone().multiply(new Victor(t, t)))
  }
}
