import Victor from "victor"
import { Clipper, FillRule, Path64 } from "clipper2-js"
import Machine, { machineOptions } from "./Machine"
import { distance, cloneVertex, totalDistance } from "@/common/geometry"
import { traceBoundary } from "@/common/boundary"

const SCALE = 1000

export default class PolygonMachine extends Machine {
  constructor(state, maskVertices) {
    super(state)
    this.label = "Polygon"

    if (maskVertices && maskVertices.length >= 3) {
      this.boundary = traceBoundary(maskVertices, 0)
    } else {
      this.boundary = []
    }

    this.clipperBoundary = new Path64()
    for (const v of this.boundary) {
      this.clipperBoundary.push({
        x: Math.round(v.x * SCALE),
        y: Math.round(v.y * SCALE),
      })
    }

    // Precompute edges and perimeter length
    this.edges = []
    this.perimeterLen = 0
    this.edgeCumulativeLen = [0]

    for (let i = 0; i < this.boundary.length; i++) {
      const next = (i + 1) % this.boundary.length
      const p1 = this.boundary[i]
      const p2 = this.boundary[next]
      const len = distance(p1, p2)

      this.edges.push({ p1, p2, len, index: i })
      this.perimeterLen += len
      this.edgeCumulativeLen.push(this.perimeterLen)
    }
  }

  // Override enforceLimits to use Clipper2 intersection
  enforceLimits() {
    if (this.boundary.length < 3 || this.vertices.length < 2) {
      return this
    }

    // Convert vertices to Clipper2 path
    const subjectPath = new Path64()
    for (const v of this.vertices) {
      subjectPath.push({
        x: Math.round(v.x * SCALE),
        y: Math.round(v.y * SCALE),
      })
    }

    // Use Clipper2 intersection
    const result = Clipper.Intersect(
      [subjectPath],
      [this.clipperBoundary],
      FillRule.NonZero,
    )

    // Convert result back to vertices
    if (result.length > 0) {
      // Take the largest result path
      const largestPath = result.reduce((a, b) => (a.length > b.length ? a : b))
      this.vertices = largestPath.map(
        (pt) => new Victor(pt.x / SCALE, pt.y / SCALE),
      )
    } else {
      this.vertices = []
    }

    return this
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      type: "polygon",
    }
  }

  getOptions() {
    return machineOptions
  }

  // Project a point to the nearest edge of the polygon
  nearestPerimeterVertex(vertex) {
    if (this.boundary.length < 2) {
      return cloneVertex(vertex)
    }

    let nearestPoint = null
    let nearestDist = Infinity

    for (const edge of this.edges) {
      const projected = this.projectToEdge(vertex, edge.p1, edge.p2)
      const d = distance(vertex, projected)

      if (d < nearestDist) {
        nearestDist = d
        nearestPoint = projected
      }
    }

    return nearestPoint || cloneVertex(vertex)
  }

  // Project a point onto a line segment
  projectToEdge(point, p1, p2) {
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

  // Distance from point to line segment
  distToEdge(point, p1, p2) {
    const projected = this.projectToEdge(point, p1, p2)
    return distance(point, projected)
  }

  // Check if a segment lies on the polygon perimeter
  onPerimeter(v1, v2, delta = 0.001) {
    for (const edge of this.edges) {
      const d1 = this.distToEdge(v1, edge.p1, edge.p2)
      const d2 = this.distToEdge(v2, edge.p1, edge.p2)

      if (d1 < delta && d2 < delta) {
        return true
      }
    }
    return false
  }

  // Distance along perimeter between two points
  perimeterDistance(v1, v2) {
    return totalDistance(this.tracePerimeter(v1, v2, true))
  }

  // Trace the perimeter between two points (shortest path)
  tracePerimeter(p1, p2, includeOriginalPoints = false) {
    if (this.boundary.length < 3) {
      return includeOriginalPoints ? [p1, p2] : []
    }

    // Find which edges the points are on
    const edge1 = this.findNearestEdge(p1)
    const edge2 = this.findNearestEdge(p2)

    if (edge1 === null || edge2 === null) {
      return includeOriginalPoints ? [p1, p2] : []
    }

    // Get positions along perimeter
    const pos1 = this.getPerimeterPosition(p1)
    const pos2 = this.getPerimeterPosition(p2)

    // Calculate forward and backward distances and choose the shorter one
    const forwardDist =
      pos2 >= pos1 ? pos2 - pos1 : this.perimeterLen - pos1 + pos2
    const backwardDist = this.perimeterLen - forwardDist
    const goForward = forwardDist <= backwardDist

    const points = []
    if (includeOriginalPoints) {
      points.push(p1)
    }

    // Collect corner vertices along the path
    if (goForward) {
      let idx = edge1.index
      while (idx !== edge2.index) {
        idx = (idx + 1) % this.boundary.length
        if (idx !== edge2.index || this.boundary.length <= 2) {
          points.push(cloneVertex(this.boundary[idx]))
        }
      }
    } else {
      let idx = edge1.index
      while (idx !== edge2.index) {
        points.push(cloneVertex(this.boundary[idx]))
        idx = (idx - 1 + this.boundary.length) % this.boundary.length
      }
    }

    if (includeOriginalPoints) {
      points.push(p2)
    }

    return points
  }

  // Find which edge a point is on (or nearest to)
  findNearestEdge(point) {
    let nearestEdge = null
    let nearestDist = Infinity

    for (const edge of this.edges) {
      const d = this.distToEdge(point, edge.p1, edge.p2)
      if (d < 1e-6) return edge // Early exit for on-boundary points

      if (d < nearestDist) {
        nearestDist = d
        nearestEdge = edge
      }
    }

    return nearestEdge
  }

  // Get position along perimeter (0 to perimeterLength)
  getPerimeterPosition(vertex) {
    const edge = this.findNearestEdge(vertex)

    if (!edge) return 0

    const baseLen = this.edgeCumulativeLen[edge.index]
    const edgeProgress = distance(edge.p1, vertex)

    return baseLen + edgeProgress
  }

  // Total perimeter length
  getPerimeterLength() {
    return this.perimeterLen
  }

  // Outline the perimeter (for border drawing)
  outlinePerimeter() {
    if (this.boundary.length < 3) return this

    if (this.vertices.length > 0) {
      const perimeterPath = [...this.boundary, cloneVertex(this.boundary[0])]

      this.vertices = this.vertices.concat(perimeterPath)
    }

    return this
  }

  addStartPoint() {
    return this
  }

  addEndPoint() {
    return this
  }
}
