import PolygonMachine from "./PolygonMachine"
import { cloneVertices, cloneVertex } from "@/common/geometry"
import { closest } from "@/common/proximity"

const CLOSED_PATH_EPSILON = 0.01

const isPathClosed = (vertices) => {
  if (vertices.length < 3) return false
  const first = vertices[0]
  const last = vertices[vertices.length - 1]
  return first.distance(last) < CLOSED_PATH_EPSILON
}

// Machine that clips vertices that fall INSIDE the polygon mask (inverted)
// Keeps vertices outside the mask, removes vertices inside
export default class PolygonInvertedMachine extends PolygonMachine {
  enforceLimits() {
    if (this.boundary.length < 3) {
      return this
    }

    const isClosed = isPathClosed(this.vertices)

    if (isClosed) {
      const clipperResult = this.clipperDifference(this.vertices)

      if (clipperResult && clipperResult.length > 0) {
        this.vertices = clipperResult
        return this
      }

      if (clipperResult !== null) {
        this.vertices = []
        return this
      }
    }

    return this.enforceInvertedLimits()
  }

  // Invert clipSegment logic:
  // - Both inside mask → [] (clip out)
  // - Both outside mask → [start, end] (keep)
  // - Start inside, exit → [exitPoint, end]
  // - Start outside, enter → [start, entryPoint]
  // - Crosses through → [start, entryPoint] + perimeter + [exitPoint, end]
  clipSegment(start, end) {
    const startInside = this.inBounds(start)
    const endInside = this.inBounds(end)

    if (startInside && endInside) {
      return []
    }

    if (!startInside && !endInside) {
      const intersections = this.findIntersections(start, end)

      if (intersections.length >= 2) {
        intersections.sort((a, b) => a.t - b.t)
        const entry = intersections[0].point
        const exit = intersections[intersections.length - 1].point
        const perimeterPath = this.tracePerimeter(entry, exit, true)
        return [start, ...perimeterPath, end]
      }

      return [start, end]
    }

    const intersections = this.findIntersections(start, end)

    if (intersections.length === 0) {
      return startInside ? [] : [start, end]
    }

    const intersection = intersections[0].point

    if (startInside && !endInside) {
      return [cloneVertex(intersection), end]
    }

    if (!startInside && endInside) {
      return [start, cloneVertex(intersection)]
    }

    return [start, end]
  }

  nearestVertex(vertex) {
    if (this.inBounds(vertex)) {
      return this.nearestPerimeterVertex(vertex)
    }
    return vertex
  }

  outlinePerimeter() {
    if (this.boundary.length < 3) return this
    if (this.vertices.length === 0) return this

    const borderStart = cloneVertex(this.boundary[0])
    const border = [...cloneVertices(this.boundary), borderStart]
    const closestVertex = closest(this.vertices, borderStart)

    if (closestVertex) {
      const closestIndex = this.vertices.indexOf(closestVertex)

      this.vertices.splice(closestIndex, 0, ...border)
    }

    return this
  }
}
