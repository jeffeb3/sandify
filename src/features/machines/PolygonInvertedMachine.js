import Victor from "victor"
import { Clipper, FillRule } from "clipper2-js"
import PolygonMachine from "./PolygonMachine"
import { cloneVertices, cloneVertex } from "@/common/geometry"
import { closest } from "@/common/proximity"
import { eulerianTrail } from "@/common/eulerian_trail/eulerianTrail"
import { eulerizeEdges } from "@/common/chinesePostman"

const CLIPPER_SCALE = 1000
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
  // Use Clipper2 Difference for closed polygons, line-by-line for open paths
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
      // Clipper returned empty - shape is entirely inside mask, return empty
      if (clipperResult !== null) {
        this.vertices = []

        return this
      }
      // Fall through to line-by-line if Clipper failed
    }

    // For open paths (or if Clipper fails), use line-by-line approach
    return this.enforceInvertedLimits()
  }

  // Compute difference of input polygon minus mask polygon using Clipper2.
  // Returns parts of input that are OUTSIDE the mask.
  clipperDifference(inputVertices) {
    if (this.boundary.length < 3 || inputVertices.length < 3) {
      return null
    }

    const inputPath = this.verticesToPath64(inputVertices)
    const maskPath = this.verticesToPath64(this.boundary)
    const result = Clipper.Difference([inputPath], [maskPath], FillRule.NonZero)

    if (!result) {
      return null  // Clipper failed
    }

    if (result.length === 0) {
      return []  // Shape is entirely inside mask
    }

    // Convert all paths to Victor vertices
    const allPaths = result.map(path =>
      path.map(pt => new Victor(pt.x / CLIPPER_SCALE, pt.y / CLIPPER_SCALE))
    )

    // Close each path if not already closed
    allPaths.forEach(path => {
      if (path.length > 0 && !isPathClosed(path)) {
        path.push(path[0].clone())
      }
    })

    // If only one path, return it directly
    if (allPaths.length === 1) {
      return allPaths[0]
    }

    // For multiple paths, use graph-based approach to connect them optimally
    const graph = this.buildClipperGraph(allPaths)

    return this.traceClipperGraph(graph)
  }

  // Trace graph using Eulerian trail for optimal path through all edges
  traceClipperGraph(graph) {
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

    for (const nodeKey of trail) {
      const node = graph.nodeMap[nodeKey]

      if (node) {
        if (vertices.length === 0 ||
            vertices[vertices.length - 1].distance(node) > CLOSED_PATH_EPSILON) {
          vertices.push(new Victor(node.x, node.y))
        }
      }
    }

    return vertices
  }

  // Invert clipSegment logic:
  // - Both inside mask → [] (clip out)
  // - Both outside mask → [start, end] (keep)
  // - Start inside, exit → [exitPoint, end]
  // - Start outside, enter → [start, entryPoint]
  // - Crosses through → [start, entryPoint] + perimeter + [exitPoint, end]
  clipSegment(start, end) {
    const startInside = this.inBounds(start)  // inBounds = inside polygon mask
    const endInside = this.inBounds(end)

    // Both inside the mask = clip out entirely
    if (startInside && endInside) {
      return []
    }

    // Both outside the mask = keep entirely
    if (!startInside && !endInside) {
      // But check if line crosses through the mask
      const intersections = this.findIntersections(start, end)

      if (intersections.length >= 2) {
        // Line crosses through mask - need to trace perimeter
        // Sort intersections by distance from start
        intersections.sort((a, b) => start.distance(a) - start.distance(b))
        const entry = intersections[0]
        const exit = intersections[intersections.length - 1]

        const perimeterPath = this.tracePerimeter(entry, exit, true)
        return [start, ...perimeterPath, end]
      }

      return [start, end]
    }

    // Find intersection point
    const intersections = this.findIntersections(start, end)
    if (intersections.length === 0) {
      // Shouldn't happen, but fallback
      return startInside ? [] : [start, end]
    }

    const intersection = intersections[0]

    // Start inside, end outside → keep [intersection, end]
    if (startInside && !endInside) {
      return [cloneVertex(intersection), end]
    }

    // Start outside, end inside → keep [start, intersection]
    if (!startInside && endInside) {
      return [start, cloneVertex(intersection)]
    }

    return [start, end]
  }

  // For inverted: points inside polygon mask should project to perimeter
  nearestVertex(vertex) {
    if (this.inBounds(vertex)) {  // inBounds = inside polygon mask
      return this.nearestPerimeterVertex(vertex)
    }
    return vertex
  }

  // For enforceInvertedLimits: inBounds returns true for points INSIDE the mask
  // (the area to be excluded). This matches RectInvertedMachine's behavior.
  // Don't override - use parent's inBounds which returns true for inside polygon.

  // Helper: find all intersection points between line segment and polygon boundary
  findIntersections(start, end) {
    const intersections = []

    for (const edge of this.edges) {
      const intersection = this.lineIntersection(start, end, edge.p1, edge.p2)

      if (intersection) {
        intersections.push(intersection)
      }
    }

    return intersections
  }

  // Add mask boundary to the path (for border drawing)
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
