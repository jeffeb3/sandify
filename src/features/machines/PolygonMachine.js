import Victor from "victor"
import { Clipper, FillRule, Path64 } from "clipper2-js"
import Machine, { machineOptions } from "./Machine"
import {
  distance,
  cloneVertex,
  totalDistance,
  pointInPolygon,
  snapToGrid,
  projectToSegment,
  distanceToSegment,
} from "@/common/geometry"
import Graph from "@/common/Graph"
import { eulerianTrail } from "@/common/eulerian_trail/eulerianTrail"
import { eulerizeEdges } from "@/common/chinesePostman"

const CLIPPER_SCALE = 1000 // Scale factor for Clipper2 integer coordinates
const CLOSED_PATH_EPSILON = 0.01 // Max gap to consider path closed
const EDGE_EPSILON = 1e-6 // Tolerance for on-edge detection
const PARALLEL_EPSILON = 1e-10 // Tolerance for parallel line detection
const NODE_TOLERANCE = 1 // Proximity tolerance for graph node merging

// Helper: check if a path forms a closed loop
const isPathClosed = (vertices) => {
  if (vertices.length < 3) return false
  const first = vertices[0]
  const last = vertices[vertices.length - 1]
  return first.distance(last) < CLOSED_PATH_EPSILON
}

// Helper: check if two line segments intersect (excluding endpoints)
const segmentsIntersect = (p1, p2, p3, p4) => {
  const d1x = p2.x - p1.x
  const d1y = p2.y - p1.y
  const d2x = p4.x - p3.x
  const d2y = p4.y - p3.y

  const cross = d1x * d2y - d1y * d2x
  if (Math.abs(cross) < PARALLEL_EPSILON) return false

  const dx = p3.x - p1.x
  const dy = p3.y - p1.y

  const t = (dx * d2y - dy * d2x) / cross
  const u = (dx * d1y - dy * d1x) / cross

  // Check if intersection is strictly inside both segments (not at endpoints)
  return (
    t > EDGE_EPSILON &&
    t < 1 - EDGE_EPSILON &&
    u > EDGE_EPSILON &&
    u < 1 - EDGE_EPSILON
  )
}

// Helper: check if a path is self-intersecting
// Two conditions indicate self-intersection:
// 1. Any non-adjacent edges cross each other
// 2. Any vertex position is visited multiple times (path passes through same point)
const isSelfIntersecting = (vertices) => {
  if (vertices.length < 4) return false

  const n = vertices.length
  const VERTEX_TOLERANCE = 0.5 // Tolerance for "same position" detection

  // Check if any vertex position is visited multiple times (like Rose center)
  // Use a grid-based approach for efficiency
  const visited = new Map()
  for (let i = 0; i < n; i++) {
    const v = vertices[i]
    // Round to grid for tolerance-based matching
    const key = `${Math.round(v.x / VERTEX_TOLERANCE)},${Math.round(v.y / VERTEX_TOLERANCE)}`
    const prevIndex = visited.get(key)
    // If we've seen this position before and it's not adjacent, path revisits this point
    // Exclude the closing vertex (last matching first) - that's normal path closure
    const isClosingVertex = i === n - 1 && prevIndex === 0
    if (
      prevIndex !== undefined &&
      Math.abs(i - prevIndex) > 2 &&
      !isClosingVertex
    ) {
      return true
    }
    visited.set(key, i)
  }

  // Check for crossing edges
  for (let i = 0; i < n - 1; i++) {
    const p1 = vertices[i]
    const p2 = vertices[i + 1]

    for (let j = i + 2; j < n - 1; j++) {
      if (i === 0 && j === n - 2) continue

      const p3 = vertices[j]
      const p4 = vertices[j + 1]

      if (segmentsIntersect(p1, p2, p3, p4)) {
        return true
      }
    }
  }
  return false
}

export default class PolygonMachine extends Machine {
  constructor(state, maskVertices) {
    super(state)
    this.label = "Polygon"
    this.boundary = maskVertices?.length >= 3 ? [...maskVertices] : []
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

    for (
      let i = 0, j = this.boundary.length - 1;
      i < this.boundary.length;
      j = i++
    ) {
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
    const intersections = this.findIntersections(start, end)

    // Sort intersections by position along segment (needed for most cases)
    if (intersections.length > 0) {
      intersections.sort((a, b) => a.t - b.t)
    }

    // Both inside with no intersections - segment stays inside
    if (startIn && endIn && intersections.length === 0) {
      return [start, end]
    }

    // Both inside but has intersections - segment passes through a concave notch
    if (startIn && endIn && intersections.length >= 2) {
      const perimeterPath = this.tracePerimeter(
        intersections[0].point,
        intersections[1].point,
        false,
      )
      return [
        start,
        intersections[0].point,
        ...perimeterPath,
        intersections[1].point,
        end,
      ]
    }

    // Both outside, no intersections - trace perimeter between nearest points
    if (intersections.length === 0) {
      return this.tracePerimeterBetweenNearest(start, end)
    }

    // Start inside, exit
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

    // Fallback - single intersection or edge case
    return this.tracePerimeterBetweenNearest(start, end)
  }

  // Helper: trace perimeter between nearest points to start/end
  tracePerimeterBetweenNearest(start, end) {
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

  // Trace the perimeter between two points.
  // If inputRing provided, prefer path with more vertices inside the input polygon.
  // Otherwise, use shortest path.
  tracePerimeter(p1, p2, includeOriginalPoints = false, inputRing = null) {
    if (this.boundary.length < 3) {
      return includeOriginalPoints ? [p1, p2] : []
    }

    // Find which edges the points are on
    const edge1 = this.findNearestEdge(p1)
    const edge2 = this.findNearestEdge(p2)

    if (edge1 === null || edge2 === null) {
      return includeOriginalPoints ? [p1, p2] : []
    }

    // Helper to collect vertices in a given direction
    const collectPath = (forward) => {
      const pts = []

      if (includeOriginalPoints) {
        pts.push(p1)
      }

      if (edge1.index === edge2.index) {
        // Same edge - no intermediate vertices needed
      } else if (forward) {
        let idx = (edge1.index + 1) % this.boundary.length

        while (true) {
          pts.push(cloneVertex(this.boundary[idx]))
          if (idx === edge2.index) break
          idx = (idx + 1) % this.boundary.length
        }
      } else {
        let idx = edge1.index

        while (idx !== edge2.index) {
          pts.push(cloneVertex(this.boundary[idx]))
          idx = (idx - 1 + this.boundary.length) % this.boundary.length
        }
      }

      if (includeOriginalPoints) {
        pts.push(p2)
      }
      return pts
    }

    // Get positions along perimeter for distance calculation
    const pos1 = this.getPerimeterPosition(p1)
    const pos2 = this.getPerimeterPosition(p2)
    const forwardDist =
      pos2 >= pos1 ? pos2 - pos1 : this.perimeterLen - pos1 + pos2
    const backwardDist = this.perimeterLen - forwardDist

    // If no input constraint, use shortest path
    if (!inputRing) {
      return collectPath(forwardDist <= backwardDist)
    }

    // Get both paths and count vertices inside input polygon
    const forwardPath = collectPath(true)
    const backwardPath = collectPath(false)

    const countInside = (path) =>
      path.filter((pt) => pointInPolygon(pt.x, pt.y, inputRing)).length
    const forwardInside = countInside(forwardPath)
    const backwardInside = countInside(backwardPath)

    // Prefer path with more vertices inside input polygon
    // If equal, use shorter path
    if (forwardInside > backwardInside) {
      return forwardPath
    } else if (backwardInside > forwardInside) {
      return backwardPath
    } else {
      return forwardDist <= backwardDist ? forwardPath : backwardPath
    }
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
      const last = this.vertices[this.vertices.length - 1]
      const nearestPoint = this.nearestPerimeterVertex(last)

      // Find which edge the nearest point is on to determine starting index
      const edge = this.findNearestEdge(nearestPoint)
      if (!edge) return this

      // Build perimeter path starting from nearest point, going around, back to start
      const startIdx = (edge.index + 1) % this.boundary.length
      const perimeterPath = [cloneVertex(nearestPoint)]

      for (let i = 0; i < this.boundary.length; i++) {
        const idx = (startIdx + i) % this.boundary.length
        perimeterPath.push(cloneVertex(this.boundary[idx]))
      }

      perimeterPath.push(cloneVertex(nearestPoint))

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

    const isClosed = isPathClosed(this.vertices)
    // Self-intersecting paths (like Rose curves) must use line-by-line clipping.
    // Clipper2 treats self-intersecting polygons as simple regions and loses
    // the internal crossing pattern.
    const selfIntersecting = isClosed && isSelfIntersecting(this.vertices)

    // For closed non-self-intersecting polygons, use Clipper2 intersection for accurate results.
    // This handles cases where mask vertices are entirely inside the input shape.
    if (isClosed && !selfIntersecting) {
      const clipperResult = this.clipperIntersect(this.vertices)
      if (clipperResult && clipperResult.length > 0) {
        this.vertices = clipperResult
        return this
      }
      // Clipper returned empty - shapes don't overlap, return empty result
      // Don't fall through to line-by-line which may incorrectly add perimeter vertices
      if (clipperResult !== null) {
        this.vertices = []
        return this
      }
      // Fall through to line-by-line only if Clipper actually failed (returned null)
    }

    // For open paths (or if Clipper fails), use line-by-line approach
    let cleanVertices = []
    let previous = null
    let prevInBounds = null
    let lastExitPoint = null

    // Build input polygon ring for constraining perimeter traces (closed non-self-intersecting only)
    // pointInPolygon uses ray casting (even-odd) which gives wrong results for self-intersecting paths
    let inputRing = null
    if (isClosed && !selfIntersecting) {
      const inputVerts = this.vertices.slice(0, -1)
      inputRing = inputVerts.map((v) => [v.x, v.y])
    }

    for (let next = 0; next < this.vertices.length; next++) {
      const vertex = this.vertices[next]
      const currInBounds = this.inBounds(vertex)

      if (previous) {
        const clipped = this.clipSegment(previous, vertex)

        if (clipped.length > 0) {
          const firstClipped = clipped[0]
          const lastClipped = clipped[clipped.length - 1]

          // Determine if this segment actually crosses into/out of the mask
          // vs just tracing along the perimeter outside
          const actuallyEnters = !prevInBounds && currInBounds // outside -> inside
          const actuallyExits = prevInBounds && !currInBounds // inside -> outside
          const crossesThrough =
            !prevInBounds && !currInBounds && clipped.length >= 2 // outside -> crosses mask -> outside
          const bothInside = prevInBounds && currInBounds // inside -> inside

          // When we re-enter the mask (or cross through it) and we have a previous
          // exit point, trace the perimeter from exit to entry. This ensures the
          // clipped path follows the mask boundary instead of taking shortcuts.
          if (lastExitPoint && (actuallyEnters || crossesThrough)) {
            const entryPoint = firstClipped
            const perimeterPath = this.traceAndFilterPerimeter(
              lastExitPoint,
              entryPoint,
              inputRing,
            )

            cleanVertices.push(...perimeterPath)
          }

          // Only add clipped points when segment actually interacts with mask interior
          // Skip outside->outside perimeter traces (no intersections)
          const shouldAddClipped =
            actuallyEnters || actuallyExits || crossesThrough || bothInside
          if (shouldAddClipped) {
            for (const pt of clipped) {
              cleanVertices.push(this.nearestVertex(pt))
            }
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
        if (currInBounds) {
          // First vertex inside - add it
          cleanVertices.push(cloneVertex(vertex))
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
      const perimeterPath = this.traceAndFilterPerimeter(
        lastExitPoint,
        firstPoint,
        inputRing,
      )

      cleanVertices.push(...perimeterPath)
      cleanVertices.push(cloneVertex(firstPoint)) // Close back to start
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
        if (lenSq > PARALLEL_EPSILON) {
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
    if (Math.abs(cross) < PARALLEL_EPSILON) return null

    const dx = p3.x - p1.x
    const dy = p3.y - p1.y

    const t = (dx * d2y - dy * d2x) / cross
    const u = (dx * d1y - dy * d1x) / cross

    // Check if intersection is within both segments
    if (t > EDGE_EPSILON && t < 1 - EDGE_EPSILON && u >= 0 && u <= 1) {
      return new Victor(p1.x + t * d1x, p1.y + t * d1y)
    }

    return null
  }

  // Project a point onto a line segment
  projectToEdge(point, p1, p2) {
    return projectToSegment(point, p1, p2)
  }

  // Distance from point to line segment
  distToEdge(point, p1, p2) {
    return distanceToSegment(point, p1, p2)
  }

  findNearestEdge(point) {
    let nearestEdge = null
    let nearestDist = Infinity

    for (const edge of this.edges) {
      const d = this.distToEdge(point, edge.p1, edge.p2)

      if (d < EDGE_EPSILON) return edge // Early exit for on-boundary points

      if (d < nearestDist) {
        nearestDist = d
        nearestEdge = edge
      }
    }

    return nearestEdge
  }

  // Trace perimeter between two points and filter to stay within input polygon.
  // Combines tracePerimeter + pointInPolygon filtering.
  traceAndFilterPerimeter(p1, p2, inputRing) {
    let path = this.tracePerimeter(p1, p2, false, inputRing)

    if (inputRing) {
      path = path.filter((pt) => pointInPolygon(pt.x, pt.y, inputRing))
    }

    return path
  }

  // Convert array of vertices to Clipper2 Path64 format
  verticesToPath64(vertices) {
    const path = new Path64()
    for (const v of vertices) {
      path.push({
        x: Math.round(v.x * CLIPPER_SCALE),
        y: Math.round(v.y * CLIPPER_SCALE),
      })
    }
    return path
  }

  // Compute intersection of input polygon with mask polygon using Clipper2.
  // Returns array of Victor vertices, empty array if no intersection, or null if Clipper fails.
  clipperIntersect(inputVertices) {
    if (this.boundary.length < 3 || inputVertices.length < 3) {
      return null
    }

    const inputPath = this.verticesToPath64(inputVertices)
    const maskPath = this.verticesToPath64(this.boundary)
    const result = Clipper.Intersect([inputPath], [maskPath], FillRule.NonZero)

    if (!result) {
      return null // Clipper failed
    }

    if (result.length === 0) {
      return [] // No intersection - shapes don't overlap
    }

    // Convert all paths to Victor vertices and combine them
    // For multiple disconnected regions, we connect them with the shortest jumps
    const allPaths = result.map((path) =>
      path.map((pt) => new Victor(pt.x / CLIPPER_SCALE, pt.y / CLIPPER_SCALE)),
    )

    // Close each path if not already closed
    allPaths.forEach((path) => {
      if (path.length > 0 && !isPathClosed(path)) {
        path.push(path[0].clone())
      }
    })

    // If only one path, return it directly
    if (allPaths.length === 1) {
      return allPaths[0]
    }

    // Use graph-based approach (like SVG import) to connect multiple paths
    // This minimizes travel by finding optimal Eulerian trail through all edges
    const graph = this.buildClipperGraph(allPaths)

    graph.connectComponents()

    const edges = Object.values(graph.edgeMap)
    const dijkstraFn = (startKey, endKey) =>
      graph.dijkstraShortestPath(startKey, endKey)
    const { edges: eulerizedEdges } = eulerizeEdges(
      edges,
      dijkstraFn,
      graph.nodeMap,
    )
    const trail = eulerianTrail({ edges: eulerizedEdges })
    const vertices = []

    // Convert trail back to vertices
    for (const nodeKey of trail) {
      const node = graph.nodeMap[nodeKey]

      if (node) {
        // Skip duplicate consecutive vertices
        if (
          vertices.length === 0 ||
          vertices[vertices.length - 1].distance(node) > CLOSED_PATH_EPSILON
        ) {
          vertices.push(new Victor(node.x, node.y))
        }
      }
    }

    return vertices
  }

  // Build graph from Clipper result paths for Eulerian trail optimization
  buildClipperGraph(paths) {
    const graph = new Graph()

    for (const path of paths) {
      if (path.length < 2) continue

      // Create nodes for all vertices in path
      const nodes = path.map((pt) =>
        this.proximityNode(pt.x, pt.y, NODE_TOLERANCE),
      )

      // Add nodes and edges
      nodes.forEach((node) => graph.addNode(node))
      for (let i = 0; i < nodes.length - 1; i++) {
        if (nodes[i].toString() !== nodes[i + 1].toString()) {
          graph.addEdge(nodes[i], nodes[i + 1])
        }
      }
    }

    return graph
  }

  // Create node with proximity-based key (nodes within tolerance share key)
  proximityNode(x, y, tolerance = NODE_TOLERANCE) {
    const sx = snapToGrid(x, tolerance)
    const sy = snapToGrid(y, tolerance)

    return { x, y, toString: () => `${sx.toFixed(2)},${sy.toFixed(2)}` }
  }
}
