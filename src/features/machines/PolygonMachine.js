import Victor from "victor"
import Machine, { machineOptions } from "./Machine"
import { distance, cloneVertex, totalDistance } from "@/common/geometry"

export default class PolygonMachine extends Machine {
  constructor(state, maskVertices) {
    super(state)
    this.label = "Polygon"

    this.boundary =
      maskVertices?.length >= 3 ? [...maskVertices] : []

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

  // ---------------------------------------------------------------------------
  // Base class overrides
  // ---------------------------------------------------------------------------

  getInitialState() {
    return {
      ...super.getInitialState(),
      type: "polygon",
    }
  }

  getOptions() {
    return machineOptions
  }

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

  nearestVertex(vertex) {
    if (this.inBounds(vertex)) {
      return cloneVertex(vertex)
    }

    return this.nearestPerimeterVertex(vertex)
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

  // Clip a line segment against the polygon boundary
  clipSegment(start, end) {
    const startIn = this.inBounds(start)
    const endIn = this.inBounds(end)

    // Find intersections with polygon edges
    const intersections = this.findIntersections(start, end)

    // Both inside with no intersections - segment stays inside
    if (startIn && endIn && intersections.length === 0) {
      return [start, end]
    }

    // Both inside but has intersections - segment passes through a concave notch
    // Need to break at intersections and trace perimeter through the notch
    if (startIn && endIn && intersections.length >= 2) {
      intersections.sort((a, b) => a.t - b.t)
      const result = [start, intersections[0].point]

      // Add perimeter trace through the notch, then continue inside
      const perimeterPath = this.tracePerimeter(
        intersections[0].point,
        intersections[1].point,
        false,
      )
      result.push(...perimeterPath)
      result.push(intersections[1].point, end)

      return result
    }

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

  getPerimeterPosition(vertex) {
    const edge = this.findNearestEdge(vertex)

    if (!edge) return 0

    const baseLen = this.edgeCumulativeLen[edge.index]
    const edgeProgress = distance(edge.p1, vertex)

    return baseLen + edgeProgress
  }

  getPerimeterLength() {
    return this.perimeterLen
  }

  outlinePerimeter() {
    if (this.boundary.length < 3) return this

    if (this.vertices.length > 0) {
      const perimeterPath = [...this.boundary, cloneVertex(this.boundary[0])]

      this.vertices = this.vertices.concat(perimeterPath)
    }

    return this
  }

  // Override optimizePerimeter to preserve perimeter vertices for polygon masks
  // The base class strips consecutive perimeter vertices as "redundant", but for
  // polygon clipping the perimeter IS the clipping boundary and must be preserved
  optimizePerimeter() {
    return this
  }

  addStartPoint() {
    return this
  }

  addEndPoint() {
    return this
  }

  // Override to trace perimeter between exit/entry points for concave shapes
  enforceLimits() {
    if (this.boundary.length < 3) {
      return this
    }

    const DEBUG = false // eslint-disable-line no-unused-vars
    let cleanVertices = []
    let previous = null
    let prevInBounds = null
    let lastExitPoint = null
    let hasBeenInside = false // Track if we've ever been inside the mask

    if (DEBUG) {
      console.log("=== enforceLimits START ===")
      console.log("boundary vertices:", this.boundary.length)
      console.log("input vertices:", this.vertices.length)
      // Log which input vertices are inside/outside the mask
      this.vertices.forEach((v, i) => {
        console.log(`  vertex[${i}] (${v.x.toFixed(1)}, ${v.y.toFixed(1)}) inBounds=${this.inBounds(v)}`)
      })
    }

    for (let next = 0; next < this.vertices.length; next++) {
      const vertex = this.vertices[next]
      const currInBounds = this.inBounds(vertex)

      if (previous) {
        const clipped = this.clipSegment(previous, vertex)

        if (DEBUG) {
          console.log(`\n[${next}] prev(${previous.x.toFixed(1)},${previous.y.toFixed(1)}) -> curr(${vertex.x.toFixed(1)},${vertex.y.toFixed(1)})`)
          console.log(`    prevInBounds=${prevInBounds}, currInBounds=${currInBounds}`)
          console.log(`    clipped: [${clipped.map((v) => `(${v.x.toFixed(1)},${v.y.toFixed(1)})`).join(", ")}]`)
          console.log(`    lastExitPoint=${lastExitPoint ? `(${lastExitPoint.x.toFixed(1)},${lastExitPoint.y.toFixed(1)})` : "null"}`)
        }

        if (clipped.length > 0) {
          const firstClipped = clipped[0]
          const lastClipped = clipped[clipped.length - 1]

          // Determine if this segment actually crosses into/out of the mask
          // vs just tracing along the perimeter outside
          const actuallyEnters = !prevInBounds && currInBounds  // outside -> inside
          const actuallyExits = prevInBounds && !currInBounds   // inside -> outside
          const crossesThrough = !prevInBounds && !currInBounds && clipped.length === 2  // outside -> inside -> outside
          const bothInside = prevInBounds && currInBounds  // inside -> inside

          // When we re-enter the mask (or cross through it) and we have a previous
          // exit point, trace the perimeter from exit to entry. This ensures the
          // clipped path follows the mask boundary instead of taking shortcuts.
          if (lastExitPoint && (actuallyEnters || crossesThrough)) {
            const entryPoint = firstClipped
            const perimeterPath = this.tracePerimeter(lastExitPoint, entryPoint, false)

            if (DEBUG) {
              console.log(`    TRACE PERIMETER: exit(${lastExitPoint.x.toFixed(1)},${lastExitPoint.y.toFixed(1)}) -> entry(${entryPoint.x.toFixed(1)},${entryPoint.y.toFixed(1)})`)
              console.log(`    path: [${perimeterPath.map((v) => `(${v.x.toFixed(1)},${v.y.toFixed(1)})`).join(", ")}]`)
            }

            cleanVertices.push(...perimeterPath)
          }

          // Only add clipped points when segment actually interacts with mask interior
          // Skip outside->outside perimeter traces (no intersections)
          const shouldAddClipped = actuallyEnters || actuallyExits || crossesThrough || bothInside
          if (shouldAddClipped) {
            for (const pt of clipped) {
              cleanVertices.push(this.nearestVertex(pt))
            }
          }

          // Track if we've actually been inside the mask
          if (actuallyEnters || actuallyExits || crossesThrough || currInBounds) {
            hasBeenInside = true
          }

          // Track exit point only when we actually exit from inside
          // (not when we're just tracing perimeter outside)
          if (actuallyExits || crossesThrough) {
            lastExitPoint = lastClipped
          } else if (currInBounds) {
            lastExitPoint = null
          }
          // If still outside and was outside, keep lastExitPoint unchanged (for perimeter tracing later)
        }
      } else {
        // First vertex
        if (DEBUG) {
          console.log(`[0] first vertex (${vertex.x.toFixed(1)},${vertex.y.toFixed(1)}), inBounds=${currInBounds}`)
        }

        if (currInBounds) {
          // First vertex inside - add it
          cleanVertices.push(cloneVertex(vertex))
          hasBeenInside = true
        }
        // If first vertex is outside, don't add anything and don't set lastExitPoint.
        // We only set lastExitPoint when we actually EXIT from inside the mask.
        // The first segment's clipSegment will handle finding the entry point.
      }

      previous = vertex
      prevInBounds = currInBounds
    }

    // Close the loop: if we started outside (first point on boundary) and
    // ended with an exit point, trace perimeter back to start
    if (cleanVertices.length > 0 && lastExitPoint) {
      const firstPoint = cleanVertices[0]
      const perimeterPath = this.tracePerimeter(lastExitPoint, firstPoint, false)

      if (DEBUG) {
        console.log(`\n    CLOSING LOOP: (${lastExitPoint.x.toFixed(1)},${lastExitPoint.y.toFixed(1)}) -> (${firstPoint.x.toFixed(1)},${firstPoint.y.toFixed(1)})`)
        console.log(`    perimeterPath: [${perimeterPath.map((v) => `(${v.x.toFixed(1)},${v.y.toFixed(1)})`).join(", ")}]`)
      }

      cleanVertices.push(...perimeterPath)
    }

    if (DEBUG) {
      console.log("\n=== enforceLimits END ===")
      console.log("output vertices:", cleanVertices.length)
    }

    this.vertices = cleanVertices
    return this
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

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
}
