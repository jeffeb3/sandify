/* global console */

import Victor from "victor"
import Machine, { machineOptions } from "./Machine"
import {
  distance,
  vertexRoundP,
  cloneVertex,
  annotateVertices,
} from "@/common/geometry"
import { clip } from "liang-barsky"

const rectMachineOptions = {
  minX: {
    title: "Min x (mm)",
    min: 0,
  },
  maxX: {
    title: "Max x (mm)",
    min: 0,
  },
  minY: {
    title: "Min y (mm)",
    min: 0,
  },
  maxY: {
    title: "Max y (mm)",
    min: 0,
  },
  rectOrigin: {
    title: "Force origin",
    type: "quadrantbuttons",
  },
  ...machineOptions,
}

export default class RectMachine extends Machine {
  constructor(state) {
    super(state)
    this.label = "Rectangular"
    this.sizeX = Math.abs((this.state.maxX - this.state.minX) / 2.0)
    this.sizeY = Math.abs((this.state.maxY - this.state.minY) / 2.0)
    this.height = this.sizeY * 2
    this.width = this.sizeX * 2
    this.corners = [
      new Victor(-this.sizeX, -this.sizeY),
      new Victor(-this.sizeX, this.sizeY),
      new Victor(this.sizeX, this.sizeY),
      new Victor(this.sizeX, -this.sizeY),
    ]
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        type: "rectangular",
        minX: 0,
        maxX: 500,
        minY: 0,
        maxY: 500,
        rectOrigin: undefined,
      },
    }
  }

  getOptions() {
    return rectMachineOptions
  }

  addStartPoint() {
    return this
  }

  addEndPoint() {
    if (this.state.rectOrigin !== undefined) {
      // OK, let's assign corners indices:
      // [1]   [2]
      //
      //
      // [0]   [3]
      const corner = this.state.rectOrigin
      const first = this.vertices[0]
      const last = this.vertices[this.vertices.length - 1]
      const maxRadius =
        Math.sqrt(
          Math.pow(2.0 * this.sizeX, 2.0) + Math.pow(2.0 * this.sizeY, 2.0),
        ) / 2.0
      let scale, outPoint

      if (first.magnitude() <= last.magnitude()) {
        // It's going outward
        scale = maxRadius / last.magnitude()
        outPoint = last
      } else {
        scale = maxRadius / first.magnitude()
        outPoint = first
      }

      let clipped = this.clipSegment(
        outPoint,
        cloneVertex(outPoint).multiply(new Victor(scale, scale)),
      )
      const newPoint = clipped[clipped.length - 1]
      if (outPoint === last) {
        this.vertices = [
          this.vertices,
          annotateVertices(
            this.tracePerimeter(newPoint, this.corners[corner], true),
            { connect: true },
          ),
        ].flat()
      } else {
        this.vertices = [
          annotateVertices(
            this.tracePerimeter(this.corners[corner], newPoint, true),
            { connect: true },
          ),
          this.vertices,
        ].flat()
      }
    }

    return this
  }

  // Returns the distance along the perimeter between two points
  perimeterDistance(v1, v2) {
    return this.distance(this.tracePerimeter(v1, v2, true))
  }

  // Returns the position of a vertex along the perimeter (0 to perimeterLength).
  // Starts from bottom-left corner, goes clockwise.
  // Used for optimized segment ordering.
  getPerimeterPosition(vertex) {
    const x = vertex.x
    const y = vertex.y

    // Bottom edge: y ≈ -sizeY, x from -sizeX to sizeX
    if (Math.abs(y + this.sizeY) < 0.001) {
      return x + this.sizeX // 0 to 2*sizeX
    }
    // Right edge: x ≈ sizeX, y from -sizeY to sizeY
    if (Math.abs(x - this.sizeX) < 0.001) {
      return 2 * this.sizeX + (y + this.sizeY) // 2*sizeX to 2*sizeX + 2*sizeY
    }
    // Top edge: y ≈ sizeY, x from sizeX to -sizeX
    if (Math.abs(y - this.sizeY) < 0.001) {
      return 2 * this.sizeX + 2 * this.sizeY + (this.sizeX - x) // ... to 4*sizeX + 2*sizeY
    }
    // Left edge: x ≈ -sizeX, y from sizeY to -sizeY
    return 4 * this.sizeX + 2 * this.sizeY + (this.sizeY - y) // ... to 4*sizeX + 4*sizeY
  }

  // Returns the total perimeter length.
  getPerimeterLength() {
    return 4 * this.sizeX + 4 * this.sizeY
  }

  // Returns whether a given path lies on the perimeter of the rectangle
  onPerimeter(v1, v2, delta = 0.0001) {
    const dx = Math.abs(Math.abs(v1.x) - this.sizeX)
    const dy = Math.abs(Math.abs(v1.y) - this.sizeY)
    const rDx = Math.abs(v1.x - v2.x)
    const rDy = Math.abs(v1.y - v2.y)

    return (rDx < delta && dx < delta) || (rDy < delta && dy < delta)
  }

  outlinePerimeter() {
    const last = this.vertices[this.vertices.length - 1]

    if (last) {
      const s = this.nearestPerimeterVertex(last)
      const idx = this.nearestCornerIndex(s)
      const corners = [
        s,
        cloneVertex(this.corners[idx]),
        cloneVertex(this.corners[(idx + 1) % 4]),
        cloneVertex(this.corners[(idx + 2) % 4]),
        cloneVertex(this.corners[(idx + 3) % 4]),
        cloneVertex(this.corners[idx]),
        cloneVertex(s),
      ]
      this.vertices = this.vertices.concat(corners)
    }

    return this
  }

  // Given two perimeter points, traces the shortest valid path between them (stays on
  // perimeter). Returns a list of intermediate points on that path (if any).
  // On further consideration, this could be redone using Dijsktra's algorithm, I believe,
  // but this works and is, I believe, reasonably efficient.
  tracePerimeter(p1, p2, includeOriginalPoints = false) {
    let points

    if (
      (p1.x === p2.x && Math.abs(p1.x) === this.sizeX) ||
      (p1.y === p2.y && Math.abs(p1.y) === this.sizeY)
    ) {
      // on the same line; no connecting points needed
      points = []
    } else {
      // horizontal or vertical orientation; some gentle rounding to ensure we don't
      // end up within incorrect reading
      const lp1 = vertexRoundP(p1, 3)
      const lp2 = vertexRoundP(p2, 3)
      const o1 = Math.abs(lp1.x) === this.sizeX ? "v" : "h"
      const o2 = Math.abs(lp2.x) === this.sizeX ? "v" : "h"

      if (o1 !== o2) {
        // connects via a single corner
        points =
          o1 === "h" ? [new Victor(p2.x, p1.y)] : [new Victor(p1.x, p2.y)]
      } else {
        // connects via two corners; find the shortest way around
        if (o1 === "h") {
          let d1 = -2 * this.sizeX - p1.x - p2.x
          let d2 = 2 * this.sizeX - p1.x - p2.x
          let xSign = Math.abs(d1) > Math.abs(d2) ? 1 : -1

          points = [
            new Victor(
              Math.sign(xSign) * this.sizeX,
              Math.sign(p1.y) * this.sizeY,
            ),
            new Victor(
              Math.sign(xSign) * this.sizeX,
              -Math.sign(p1.y) * this.sizeY,
            ),
          ]
        } else {
          let d1 = -2 * this.sizeY - p1.y - p2.y
          let d2 = 2 * this.sizeY - p1.y - p2.y
          let ySign = Math.abs(d1) > Math.abs(d2) ? 1 : -1

          points = [
            new Victor(
              Math.sign(p1.x) * this.sizeX,
              Math.sign(ySign) * this.sizeY,
            ),
            new Victor(
              -Math.sign(p1.x) * this.sizeX,
              Math.sign(ySign) * this.sizeY,
            ),
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
    vertex = cloneVertex(vertex) // preserve attributes
    vertex.x = Math.min(this.sizeX, Math.max(-this.sizeX, vertex.x))
    vertex.y = Math.min(this.sizeY, Math.max(-this.sizeY, vertex.y))

    return vertex
  }

  // Returns the nearest perimeter vertex to the given vertex.
  nearestPerimeterVertex(vertex) {
    // Math.sign(0) is 0, so assume positive if this happens to ensure we get a perimeter point
    if (Math.abs(vertex.x) >= Math.abs(vertex.y)) {
      const sign = Math.sign(vertex.x) || 1
      return new Victor(sign * this.sizeX, vertex.y)
    } else {
      const sign = Math.sign(vertex.y) || 1
      return new Victor(vertex.x, sign * this.sizeY)
    }
  }

  nearestCornerIndex(vertex) {
    let n = null
    let d = Number.MAX_SAFE_INTEGER

    this.corners.forEach((corner, i) => {
      const dc = distance(corner, vertex)
      if (dc < d) {
        d = dc
        n = i
      }
    })

    return n
  }

  // The guts of logic for this limits enforcer. It will take a single line (defined by
  // start and end) and if the line goes out of bounds, returns the vertices around the
  // outside edge to follow around without messing up the shape of the vertices.
  clipSegment(start, end) {
    const quadrantStart = this.pointLocation(start)
    const quadrantEnd = this.pointLocation(end)

    if (quadrantStart === 0b0000 && quadrantEnd === 0b0000) {
      // The line is inside the boundaries
      return [start, end]
    }

    if (quadrantStart === quadrantEnd) {
      // We are in the same box, and we are out of bounds.
      return [this.nearestVertex(start), this.nearestVertex(end)]
    }

    if (quadrantStart & quadrantEnd) {
      // These points are all on one side of the box.
      return [this.nearestVertex(start), this.nearestVertex(end)]
    }

    if (quadrantStart === 0b000) {
      // We are exiting the box. Return the start, the intersection with the boundary, and the closest
      // boundary point to the exited point.
      let line = [start]
      line.push(this.boundPoint(start, end))
      line.push(this.nearestVertex(end))
      return line
    }

    if (quadrantEnd === 0b000) {
      // We are re-entering the box.
      return [this.boundPoint(end, start), end]
    }

    // We have reached a terrible place, where both points are oob, but it might intersect with the
    // work area. First, define the boundaries as lines.
    const sides = [
      // left
      [Victor(-this.sizeX, -this.sizeY), new Victor(-this.sizeX, this.sizeY)],
      // right
      [new Victor(this.sizeX, -this.sizeY), new Victor(this.sizeX, this.sizeY)],
      // bottom
      [
        new Victor(-this.sizeX, -this.sizeY),
        new Victor(this.sizeX, -this.sizeY),
      ],
      // top
      [new Victor(-this.sizeX, this.sizeY), new Victor(this.sizeX, this.sizeY)],
    ]

    // Count up the number of boundary lines intersect with our line segment.
    let intersections = []
    for (let s = 0; s < sides.length; s++) {
      const intPoint = this.intersection(start, end, sides[s][0], sides[s][1])
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
      if (
        cloneVertex(intersections[0]).subtract(start).lengthSq() >
        cloneVertex(intersections[1]).subtract(start).lengthSq()
      ) {
        let temp = intersections[0]
        intersections[0] = intersections[1]
        intersections[1] = temp
      }

      return [...intersections, this.nearestVertex(end)]
    }

    // Line doesn't intersect the box - return nearest vertices.
    // optimizePerimeter will trace between them later.
    return [this.nearestVertex(start), this.nearestVertex(end)]
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
    for (let i = 0; i < vertices.length; i++) {
      if (i > 0) d = d + distance(vertices[i], vertices[i - 1])
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

  inBounds(point) {
    return this.pointLocation(point) === 0b0000
  }

  // Determines intersection with one of the sides.
  intersection(start, end, sideStart, sideEnd) {
    let line = end.clone().subtract(start)
    let side = sideEnd.clone().subtract(sideStart)
    let lineCrossSidePerp = line.x * side.y - line.y * side.x

    // if line Cross side === 0, it means the lines are parallel so have infinite intersection points
    if (lineCrossSidePerp === 0) {
      return null
    }

    const diff = sideStart.clone().subtract(start)
    let t = (diff.x * side.y - diff.y * side.x) / lineCrossSidePerp
    if (t < 0 || t >= 1) {
      return null
    }

    const u = (diff.x * line.y - diff.y * line.x) / lineCrossSidePerp
    if (u < 0 || u >= 1) {
      return null
    }

    return start.clone().add(line.clone().multiply(new Victor(t, t)))
  }

  // returns the points if any that intersect with the line represented by start and end
  clipLine(start, end) {
    const s = [start.x, start.y]
    const e = [end.x, end.y]
    const bounds = [-this.sizeX, -this.sizeY, this.sizeX, this.sizeY]

    clip(s, e, bounds)
    return [new Victor(s[0], s[1]), new Victor(e[0], e[1])]
  }
}
