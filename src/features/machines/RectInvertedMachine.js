import RectMachine from "./RectMachine"
import Victor from "victor"
import clip from "liang-barsky"
import { cloneVertices } from "@/common/geometry"
import { closest } from "@/common/proximity"

// Machine that clips vertices that fall inside the machine limits
export default class RectInvertedMachine extends RectMachine {
  enforceLimits() {
    return this.enforceInvertedLimits()
  }

  clipSegment(start, end, log = false) {
    const quadrantStart = this.pointLocation(start)
    const quadrantEnd = this.pointLocation(end)

    if (quadrantStart === 0b0000 && quadrantEnd === 0b0000) {
      if (log) {
        console.log("line is inside limits")
      }
      return []
    }

    let a = [start.x, start.y]
    let b = [end.x, end.y]
    const bounds = [-this.sizeX, -this.sizeY, this.sizeX, this.sizeY]
    const clipped = clip(a, b, bounds)

    if (quadrantStart === 0b000) {
      if (log) {
        console.log("start is inside limits")
      }
      return [new Victor(b[0], b[1]), end]
    }

    if (quadrantEnd === 0b000) {
      if (log) {
        console.log("end is inside limits")
      }
      return [start, new Victor(a[0], a[1])]
    }

    if (clipped) {
      if (log) {
        console.log("line is outside limits, but intersects within limits")
      }
      return [
        start,
        ...this.tracePerimeter(
          new Victor(a[0], a[1]),
          new Victor(b[0], b[1]),
          true,
        ),
        end,
      ]
    } else {
      if (log) {
        console.log("line is outside limits")
      }
      return [start, end]
    }
  }

  // Finds the nearest vertex that is in the bounds. This will change the shape. i.e. this
  // doesn't care about the line segment, only about the point.
  nearestVertex(vertex) {
    if (this.pointLocation(vertex) === 0b0000) {
      return this.nearestPerimeterVertex(vertex)
    } else {
      return vertex
    }
  }

  outlinePerimeter() {
    const borderStart = new Victor(this.corners[0])
    const border = cloneVertices(this.corners)
    const closestVertex = closest(this.vertices, borderStart)

    if (closestVertex) {
      const closestIndex = this.vertices.indexOf(closestVertex)
      this.vertices.splice(closestIndex, 0, ...border)
    }
  }
}
