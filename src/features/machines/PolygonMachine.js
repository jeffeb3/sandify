import Victor from "victor"
import Machine, { machineOptions } from "./Machine"
import { distance, cloneVertex, totalDistance } from "@/common/geometry"

export default class PolygonMachine extends Machine {
  constructor(state, maskVertices) {
    super(state)
    this.label = "Polygon"

    // Use mask vertices directly (caller should trace boundary if needed)
    if (maskVertices && maskVertices.length >= 3) {
      this.boundary = [...maskVertices]
    } else {
      this.boundary = []
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

  // Use base class enforceLimits which calls clipSegment for each segment

  // Point-in-polygon test using ray casting
  inBounds(point) {
    if (this.boundary.length < 3) return false

    let inside = false
    const x = point.x
    const y = point.y

    for (let i = 0, j = this.boundary.length - 1; i < this.boundary.length; j = i++) {
      const xi = this.boundary[i].x
      const yi = this.boundary[i].y
      const xj = this.boundary[j].x
      const yj = this.boundary[j].y

      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
        inside = !inside
      }
    }

    return inside
  }

  // Return vertex constrained to inside bounds
  nearestVertex(vertex) {
    if (this.inBounds(vertex)) {
      return cloneVertex(vertex)
    }
    return this.nearestPerimeterVertex(vertex)
  }

  // Clip a line segment against the polygon boundary
  clipSegment(start, end) {
    const startIn = this.inBounds(start)
    const endIn = this.inBounds(end)

    // Both inside - return the segment as-is
    if (startIn && endIn) {
      return [start, end]
    }

    // Find intersections with polygon edges
    const intersections = this.findIntersections(start, end)

    // Both outside, no intersections - trace perimeter between nearest points
    if (intersections.length === 0) {
      const p1 = this.nearestPerimeterVertex(start)
      const p2 = this.nearestPerimeterVertex(end)
      return this.tracePerimeter(p1, p2, true)
    }

    // Sort intersections by t parameter (position along segment)
    intersections.sort((a, b) => a.t - b.t)

    // Start inside, exit - stop at intersection, let next segment trace perimeter
    if (startIn && !endIn) {
      return [start, intersections[0].point]
    }

    // Start outside, enter
    if (!startIn && endIn) {
      return [intersections[intersections.length - 1].point, end]
    }

    // Both outside but crosses through (2+ intersections)
    if (intersections.length >= 2) {
      return [intersections[0].point, intersections[1].point]
    }

    // Fallback - single intersection or edge case, trace perimeter
    const p1 = this.nearestPerimeterVertex(start)
    const p2 = this.nearestPerimeterVertex(end)
    return this.tracePerimeter(p1, p2, true)
  }

  // Find all intersections between a segment and polygon edges
  findIntersections(start, end) {
    const intersections = []
    const dx = end.x - start.x
    const dy = end.y - start.y
    const lenSq = dx * dx + dy * dy

    for (const edge of this.edges) {
      const inter = this.lineIntersection(start, end, edge.p1, edge.p2)
      if (inter) {
        let t = 0
        if (lenSq > 1e-10) {
          t = ((inter.x - start.x) * dx + (inter.y - start.y) * dy) / lenSq
        }
        intersections.push({ point: inter, t })
      }
    }

    return intersections
  }

  // Line segment intersection
  lineIntersection(p1, p2, p3, p4) {
    const d1x = p2.x - p1.x
    const d1y = p2.y - p1.y
    const d2x = p4.x - p3.x
    const d2y = p4.y - p3.y

    const cross = d1x * d2y - d1y * d2x
    if (Math.abs(cross) < 1e-10) return null

    const dx = p3.x - p1.x
    const dy = p3.y - p1.y

    const t = (dx * d2y - dy * d2x) / cross
    const u = (dx * d1y - dy * d1x) / cross

    // Check if intersection is within both segments
    const eps = 1e-6
    if (t > eps && t < 1 - eps && u >= 0 && u <= 1) {
      return new Victor(p1.x + t * d1x, p1.y + t * d1y)
    }

    return null
  }

  // Override optimizePerimeter to preserve perimeter vertices for polygon masks
  // The base class strips consecutive perimeter vertices as "redundant", but for
  // polygon clipping the perimeter IS the clipping boundary and must be preserved
  optimizePerimeter() {
    // For polygon masks, we keep all vertices from enforceLimits
    // The perimeter vertices are already correct from clipSegment's tracePerimeter calls
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
    // Each edge[i] goes from boundary[i] to boundary[i+1]
    // When tracing from edge1 to edge2, we need the corner vertices between them
    if (edge1.index === edge2.index) {
      // Same edge - no intermediate vertices needed
    } else if (goForward) {
      // Forward: add boundary[edge1+1] through boundary[edge2]
      let idx = (edge1.index + 1) % this.boundary.length
      while (true) {
        points.push(cloneVertex(this.boundary[idx]))
        if (idx === edge2.index) break
        idx = (idx + 1) % this.boundary.length
      }
    } else {
      // Backward: add boundary[edge1] down through boundary[edge2+1]
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
