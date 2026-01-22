/**
 * Boundary Algorithm: Convex
 *
 * Uses convex hull + centroid scaling. Ignores all concave details, producing
 * the simplest possible boundary. Useful when you want a clean outer envelope.
 *
 * Used by: Explicit selection only. Also serves as fallback when
 * Clipper fails on degenerate geometry (e.g., twisted tessellation paths).
 */
import Victor from "victor"
import convexHull from "convexhull-js"
import { centroid } from "@/common/geometry"
import { applyCentroidScale } from "./utils"

// Convex: use convex hull + centroid scaling
export const traceConvexBoundary = (ctx) => {
  const { vertices, scale, convex } = ctx

  return applyCentroidScale(convex.map((pt) => [pt.x, pt.y]), vertices, scale)
}

// Convex hull boundary with optional centroid scaling.
// Used as fallback when Clipper fails (e.g., twisted tessellation).
// Returns Victor objects (not CLIPPER_SCALE units).
export const traceConvexHullBoundary = (vertices, scale) => {
  const hull = convexHull(vertices.map((v) => ({ x: v.x, y: v.y })))

  if (scale !== 0 && hull.length > 0) {
    const center = centroid(vertices)
    const scaleFactor = 1 + scale / 100

    return hull.map(
      (v) =>
        new Victor(
          center.x + (v.x - center.x) * scaleFactor,
          center.y + (v.y - center.y) * scaleFactor,
        ),
    )
  }

  return hull.map((v) => new Victor(v.x, v.y))
}
