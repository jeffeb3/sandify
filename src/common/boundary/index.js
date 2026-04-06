import Victor from "victor"
import { Clipper, FillRule, Path64 } from "clipper2-js"
import convexHull from "convexhull-js"
import concaveman from "concaveman"
import {
  findBounds,
  distance,
  centerOnOrigin,
  cloneVertices,
  resizeVertices,
} from "@/common/geometry"
import { CLIPPER_SCALE } from "./utils"
import { traceFootprintBoundary } from "./footprint"
import { traceConvexBoundary, traceConvexHullBoundary } from "./convex"
import { traceExpandBoundary } from "./expand"
import { traceConcaveBoundary } from "./concave"
import { traceFillPatternBoundary } from "./fillPattern"

// ------------------------------
// Constants
// ------------------------------

const OPEN_PATH_THRESHOLD = 0.01 // Gap > 1% of size = open path
const MIN_AREA_RATIO = 0.0001 // Filter fragments < 0.01% of input area
const FILL_PATTERN_RATIO_MIN = 3 // Min ratio for fill patterns
const FILL_PATTERN_MIN_POINTS = 50 // Min points to consider fill pattern
const FILL_PATTERN_MAX_PPP = 25 // Max points-per-path for small fill patterns
const FILL_PATTERN_MANY_PATHS = 10 // Many paths threshold (relaxes PPP check)
const FILL_PATTERN_MAX_PPP_MANY = 60 // Max PPP when many paths present
const FILL_PATTERN_MAX_PATHS = 40 // Too many paths = fractal, not fill pattern
const SDF_RATIO_MULTI = 3 // Ratio threshold for multi-path (text)
const SDF_RATIO_OPEN = 2 // Ratio threshold for open fractals
const SDF_RATIO_VERY_HIGH = 40 // Very high ratio single-path = footprint (lsystem)
const DOMINANCE_RATIO = 5 // Path area ratio for "largest dominates"

// Algorithm name to numeric value mapping for traceBoundary
// null = auto, 0 = concave, 1 = expand, 2 = footprint, 3 = convex
export const boundaryAlgorithmMap = {
  auto: null,
  concave: 0,
  expand: 1,
  footprint: 2,
  convex: 3,
}

// Reverse mapping: index -> name (for numeric algorithm parameter)
const algorithmNames = ["concave", "expand", "footprint", "convex"]

export const boundaryAlgorithmChoices = Object.keys(boundaryAlgorithmMap)

// Each algorithm takes a context object and returns a hull in CLIPPER_SCALE units.
// Context: { vertices, bounds, inputWidth, inputHeight, scale, hull, convex }
const boundaryAlgorithms = {
  footprint: traceFootprintBoundary,
  convex: traceConvexBoundary,
  expand: traceExpandBoundary,
  concave: traceConcaveBoundary,
  fillPattern: traceFillPatternBoundary,
}

// ------------------------------
// Main API
// ------------------------------

// Analyze vertices and determine which border algorithm to use.
export const boundaryAlgorithm = (vertices) => {
  if (vertices.length < 3) {
    return {
      algorithm: "expand",
      boundary: [],
      boundaryPaths: 0,
      ratio: 0,
      pointsPerPath: 0,
      isOpenPath: false,
      isFillPattern: false,
      bounds: [],
    }
  }

  const bounds = findBounds(vertices)
  const shapeSize = Math.max(
    bounds[1].x - bounds[0].x,
    bounds[1].y - bounds[0].y,
  )
  const closingGap = distance(vertices[0], vertices[vertices.length - 1])
  const isOpenPath = closingGap > shapeSize * OPEN_PATH_THRESHOLD
  const inputWidth = bounds[1].x - bounds[0].x
  const inputHeight = bounds[1].y - bounds[0].y
  const path = new Path64()

  for (const v of vertices) {
    path.push({
      x: Math.round(v.x * CLIPPER_SCALE),
      y: Math.round(v.y * CLIPPER_SCALE),
    })
  }

  let boundary = Clipper.Union([path], null, FillRule.NonZero)

  if (boundary.length === 0) {
    return {
      algorithm: "expand",
      boundary: [],
      boundaryPaths: 0,
      ratio: 0,
      pointsPerPath: 0,
      isOpenPath,
      isFillPattern: false,
      bounds,
    }
  }

  // Filter out degenerate paths
  const inputArea = inputWidth * inputHeight * CLIPPER_SCALE * CLIPPER_SCALE
  const minArea = inputArea * MIN_AREA_RATIO
  const maxPathArea = Math.max(
    ...boundary.map((p) => Math.abs(Clipper.area(p))),
  )

  if (maxPathArea > 0) {
    const filtered = boundary.filter((p) => Math.abs(Clipper.area(p)) > minArea)

    if (filtered.length > 0) {
      boundary = filtered
    }
  }

  // Compute hull for ratio calculation
  const pathAreas = boundary.map((p) => Math.abs(Clipper.area(p)))
  const sortedAreas = [...pathAreas].sort((a, b) => b - a)
  const maxArea = sortedAreas[0]
  const secondArea = sortedAreas[1] || 0
  const largestDominates =
    boundary.length > 1 &&
    (secondArea === 0 || maxArea / secondArea > DOMINANCE_RATIO)
  let hull

  if (boundary.length === 1) {
    hull = boundary[0].map((pt) => [pt.x, pt.y])
  } else if (largestDominates) {
    const largestPath = boundary[pathAreas.indexOf(maxArea)]
    hull = largestPath.map((pt) => [pt.x, pt.y])
  } else {
    const hullInputPoints = boundary.flatMap((p) => p.map((pt) => [pt.x, pt.y]))
    hull = concaveman(hullInputPoints, 1.0)
  }

  const allPoints = boundary.flatMap((p) => p.map((pt) => [pt.x, pt.y]))
  const convex = convexHull(allPoints.map(([x, y]) => ({ x, y })))
  const ratio = hull.length / convex.length
  const pointsPerPath = allPoints.length / boundary.length

  // Fill patterns: many small disconnected cells (Voronoi, TessellationTwist)
  // Characteristics: multiple paths, moderate-to-high ratio, low-to-moderate points-per-path
  // No upper bound on ratio - Voronoi can have ratio=14+ with many cells
  // first/last vertex may be far apart (different cells) even though cells are closed
  //
  // Points-per-path threshold is relaxed when there are many paths (> 10):
  //   Few paths with low points-per-path = fill pattern (tessellation)
  //   Many paths with moderate points-per-path = fill pattern (voronoi)
  //   Few paths with high points-per-path = text (not fill pattern)
  //
  // But too MANY paths (> 40) = fractal-like pattern (fractalSpirograph has 64 short segments)
  // These need footprint, not the simpler fill pattern handling
  const manyPaths = boundary.length > FILL_PATTERN_MANY_PATHS
  const tooManyPaths = boundary.length > FILL_PATTERN_MAX_PATHS
  const pppThreshold = manyPaths
    ? FILL_PATTERN_MAX_PPP_MANY
    : FILL_PATTERN_MAX_PPP

  const isFillPattern =
    boundary.length > 1 &&
    !tooManyPaths && // Too many paths = fractal, not fill pattern
    ratio > FILL_PATTERN_RATIO_MIN &&
    allPoints.length > FILL_PATTERN_MIN_POINTS &&
    pointsPerPath < pppThreshold

  // Footprint detection - each case represents a shape type needing SDF approach
  const hasDegenerateArea = maxArea < minArea // Even largest path is tiny
  const hasDegenerateRatio = ratio <= 1 // Hull collapsed to convex hull

  const isMultiPathText =
    boundary.length > 1 && ratio > SDF_RATIO_MULTI && !isFillPattern
  const isOpenFractal =
    isOpenPath &&
    boundary.length === 1 &&
    (ratio >= SDF_RATIO_OPEN || hasDegenerateRatio)
  const isDegenerateOpenPath =
    isOpenPath &&
    boundary.length > 1 &&
    (hasDegenerateArea || hasDegenerateRatio)
  const isVeryHighRatio = boundary.length === 1 && ratio > SDF_RATIO_VERY_HIGH
  const useFootprint =
    isMultiPathText || isOpenFractal || isDegenerateOpenPath || isVeryHighRatio

  // Determine algorithm
  const algorithm = useFootprint
    ? "footprint"
    : isFillPattern
      ? "fillPattern"
      : "expand"

  return {
    algorithm,
    boundary,
    boundaryPaths: boundary.length,
    ratio: Math.round(ratio * 100) / 100,
    pointsPerPath: Math.round(pointsPerPath * 10) / 10,
    allPointsCount: allPoints.length,
    isOpenPath,
    isFillPattern,
    largestDominates,
    hull,
    bounds,
  }
}

// Extract the outer boundary of a shape for border tracing.
// Handles self-intersecting paths, fill patterns, and complex shapes.
//
// algorithm: null (auto-detect), 0 (concave), 1 (expand), 2 (footprint), 3 (convex)
export const traceBoundary = (vertices, scale = 0, algorithm = null) => {
  if (vertices.length < 3) {
    return [...vertices]
  }

  const detection = boundaryAlgorithm(vertices)
  const { boundary, hull: initialHull } = detection
  let hull = initialHull

  // Clipper can fail on self-intersecting or twisted paths; fall back to convex hull
  if (boundary.length === 0) {
    return traceConvexHullBoundary(vertices, scale)
  }

  // Get bounds from detection; compute convex hull for traceFillPattern
  const { bounds } = detection
  const inputWidth = bounds.length > 0 ? bounds[1].x - bounds[0].x : 0
  const inputHeight = bounds.length > 0 ? bounds[1].y - bounds[0].y : 0
  const allPoints = boundary.flatMap((p) => p.map((pt) => [pt.x, pt.y]))
  const convex = convexHull(allPoints.map(([x, y]) => ({ x, y })))

  // Determine effective algorithm from explicit parameter or auto-detection
  // Parameter values: 0=concave, 1=expand, 2=footprint, 3=convex, null=auto
  // Auto-detection returns: "expand", "fillPattern", or "footprint"
  const effectiveAlgo =
    algorithm !== null ? algorithmNames[algorithm] : detection.algorithm

  const ctx = { vertices, bounds, inputWidth, inputHeight, scale, hull, convex }
  hull = boundaryAlgorithms[effectiveAlgo](ctx) || hull

  return hull.map(([x, y]) => new Victor(x / CLIPPER_SCALE, y / CLIPPER_SCALE))
}

// Prepare a mask boundary from source vertices: trace boundary, center, and resize.
// Used by Mask effect and layer selection rendering.
export const prepareMaskBoundary = (
  vertices,
  width,
  height,
  algorithm = null,
) => {
  const boundary = traceBoundary(vertices, 0, algorithm)
  const centered = centerOnOrigin(cloneVertices(boundary))

  return resizeVertices(cloneVertices(centered), width, height, true)
}
