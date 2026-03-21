/**
 * Boundary Algorithm: Fill Pattern
 *
 * Handles shapes with many small disconnected cells where concaveman fails
 * (creates zigzag artifacts). Uses bounding box for rectangular patterns,
 * convex hull for polygonal patterns, with edge offset for scaling.
 *
 * Used by: Voronoi (many polygonal cells), TessellationTwist (grid of shapes).
 *
 * Characteristics that trigger this algorithm:
 *   - Multiple boundary paths (> 1)
 *   - Not too many paths (≤ 40, else footprint)
 *   - Ratio > 3, points > 50, low points-per-path
 */
import convexHull from "convexhull-js"
import { polygonArea } from "@/common/geometry"
import { CLIPPER_SCALE, applyEdgeOffset } from "./utils"

// Fill pattern boundary for shapes with many small disconnected cells
// (Voronoi, TessellationTwist). Concaveman fails on these (creates zigzags).
// Uses bounding box for rectangular patterns, convex hull for polygonal.
const traceFillPattern = (
  bounds,
  inputWidth,
  inputHeight,
  convex,
  vertices,
) => {
  const RECTANGULAR_THRESHOLD = 0.85 // Above this = use bounding box
  const bboxArea = inputWidth * inputHeight
  const convexArea = Math.abs(polygonArea(convex))
  const fillRatio = convexArea / (bboxArea * CLIPPER_SCALE * CLIPPER_SCALE)

  if (fillRatio > RECTANGULAR_THRESHOLD) {
    const result = [
      [bounds[0].x * CLIPPER_SCALE, bounds[0].y * CLIPPER_SCALE],
      [bounds[1].x * CLIPPER_SCALE, bounds[0].y * CLIPPER_SCALE],
      [bounds[1].x * CLIPPER_SCALE, bounds[1].y * CLIPPER_SCALE],
      [bounds[0].x * CLIPPER_SCALE, bounds[1].y * CLIPPER_SCALE],
      [bounds[0].x * CLIPPER_SCALE, bounds[0].y * CLIPPER_SCALE],
    ]

    result.bboxCenter = {
      x: (bounds[0].x + bounds[1].x) / 2,
      y: (bounds[0].y + bounds[1].y) / 2,
    }

    return result
  } else {
    const verticesConvex = convexHull(vertices.map((v) => ({ x: v.x, y: v.y })))

    return verticesConvex.map((p) => [p.x * CLIPPER_SCALE, p.y * CLIPPER_SCALE])
  }
}

// Fill pattern: bounding box or convex hull + edge offset
export const traceFillPatternBoundary = (ctx) => {
  const { vertices, bounds, inputWidth, inputHeight, scale, convex } = ctx
  const fillHull = traceFillPattern(
    bounds,
    inputWidth,
    inputHeight,
    convex,
    vertices,
  )

  return applyEdgeOffset(fillHull, scale, vertices) || fillHull
}
