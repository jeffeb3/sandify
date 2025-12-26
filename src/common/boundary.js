/* global console */
import Victor from "victor"
import {
  Clipper,
  FillRule,
  Path64,
  ClipperOffset,
  JoinType,
  EndType,
} from "clipper2-js"
import convexHull from "convexhull-js"
import concaveman from "concaveman"
import calcSdf from "bitmap-sdf"
import { contours } from "d3-contour"
import { findBounds, distance, centroid } from "./geometry"

const DEBUG = false

// Fill a polygon into a bitmap using scanline rasterization
// Used for SDF-based border tracing
const fillPolygonToBitmap = (bitmap, width, height, vertices) => {
  if (vertices.length < 3) return

  // Find y range
  let minY = Infinity,
    maxY = -Infinity
  for (const v of vertices) {
    if (v.y < minY) minY = v.y
    if (v.y > maxY) maxY = v.y
  }
  minY = Math.max(0, Math.floor(minY))
  maxY = Math.min(height - 1, Math.ceil(maxY))

  // Scanline fill
  for (let y = minY; y <= maxY; y++) {
    const intersections = []

    // Find intersections with all edges
    for (let i = 0; i < vertices.length; i++) {
      const v1 = vertices[i]
      const v2 = vertices[(i + 1) % vertices.length]

      // Skip horizontal edges
      if (v1.y === v2.y) continue

      // Check if scanline intersects this edge
      if ((v1.y <= y && v2.y > y) || (v2.y <= y && v1.y > y)) {
        const t = (y - v1.y) / (v2.y - v1.y)
        const x = v1.x + t * (v2.x - v1.x)
        intersections.push(x)
      }
    }

    // Sort intersections and fill between pairs
    intersections.sort((a, b) => a - b)
    for (let i = 0; i < intersections.length - 1; i += 2) {
      const x1 = Math.max(0, Math.floor(intersections[i]))
      const x2 = Math.min(width - 1, Math.ceil(intersections[i + 1]))
      for (let x = x1; x <= x2; x++) {
        bitmap[y * width + x] = 255
      }
    }
  }
}

// Calculate signed area of a polygon using the shoelace formula.
// https://en.wikipedia.org/wiki/Shoelace_formula
const polygonArea = (vertices) => {
  let area = 0
  const n = vertices.length

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    area += vertices[i].x * vertices[j].y
    area -= vertices[j].x * vertices[i].y
  }

  return area / 2
}

// Extract the outer boundary of a shape for border tracing.
// Handles self-intersecting paths, fill patterns, and complex shapes.
//
// Algorithm selection based on shape characteristics:
// - Simple closed shapes (Star, Heart): concaveman hull
// - Complex/open shapes (fractals, text): SDF contour extraction
// - Fill patterns (Voronoi, TessellationTwist): bounding box or convex hull
export const traceBoundary = (vertices, scale = 0) => {
  if (vertices.length < 3) {
    return [...vertices]
  }

  // Detection thresholds
  const OPEN_PATH_THRESHOLD = 0.01 // Gap > 1% of size = open path
  const MIN_AREA_RATIO = 0.0001 // Filter fragments < 0.01% of input area
  const FILL_PATTERN_RATIO = [3, 10] // Ratio range for fill patterns
  const FILL_PATTERN_MIN_POINTS = 50 // Min points to consider fill pattern
  const FILL_PATTERN_MAX_PPP = 25 // Max points-per-path for fill patterns
  const SDF_RATIO_HIGH = 10 // Ratio threshold for complex shapes
  const SDF_RATIO_MULTI = 5 // Ratio threshold for multi-path (text)
  const SDF_RATIO_OPEN = 2 // Ratio threshold for open fractals

  const SCALE = 1000
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
    path.push({ x: Math.round(v.x * SCALE), y: Math.round(v.y * SCALE) })
  }

  let boundary = Clipper.Union([path], null, FillRule.NonZero)

  if (boundary.length === 0) {
    return [...vertices]
  }

  // Filter out degenerate paths
  const inputArea = inputWidth * inputHeight * SCALE * SCALE
  const minArea = inputArea * MIN_AREA_RATIO
  const maxPathArea = Math.max(
    ...boundary.map((p) => Math.abs(Clipper.area(p))),
  )

  if (maxPathArea > 0) {
    // Has closed regions - filter out tiny fragments
    const filtered = boundary.filter((p) => Math.abs(Clipper.area(p)) > minArea)

    // If filtering removes all paths (e.g., fractal trees with small branch loops),
    // keep original boundary - these shapes need SDF approach anyway
    if (filtered.length > 0) {
      boundary = filtered
    }
  }

  // Compute hulls for shape classification
  const allPoints = boundary.flatMap((p) => p.map((pt) => [pt.x, pt.y]))
  const convex = convexHull(allPoints.map(([x, y]) => ({ x, y })))
  let hull = concaveman(allPoints, 1.0)
  const ratio = hull.length / convex.length
  const pointsPerPath = allPoints.length / boundary.length

  // Fill patterns: many small disconnected cells (Voronoi, TessellationTwist)
  const isFillPattern =
    ratio > FILL_PATTERN_RATIO[0] &&
    ratio < FILL_PATTERN_RATIO[1] &&
    allPoints.length > FILL_PATTERN_MIN_POINTS &&
    pointsPerPath < FILL_PATTERN_MAX_PPP &&
    !(isOpenPath && boundary.length === 1)

  // SDF needed for: complex shapes, multi-path text, or open fractals
  const useSdf =
    !isFillPattern &&
    (ratio > SDF_RATIO_HIGH ||
      (boundary.length > 1 && ratio > SDF_RATIO_MULTI) ||
      (isOpenPath && boundary.length === 1 && ratio >= SDF_RATIO_OPEN))

  if (DEBUG)
    console.log("[traceBoundary] detection:", {
      boundaryPaths: boundary.length,
      ratio: ratio.toFixed(1),
      pointsPerPath: pointsPerPath.toFixed(0),
      isOpenPath,
      useSdf,
      isFillPattern,
    })

  // Convex hull of original vertices - used when Clipper2 boundary
  // loses extreme points or stroke expansion fails
  const verticesConvex = () =>
    convexHull(vertices.map((v) => ({ x: v.x, y: v.y })))

  // SDF (Signed Distance Field) approach for complex/branching shapes:
  // 1. Expand path as thick stroke using ClipperOffset
  // 2. Rasterize to bitmap and compute distance field
  // 3. Extract contour at threshold (adjustable via scale param)
  // Produces smooth, uniform-offset boundaries like Photoshop's "Expand Selection"
  const traceSdf = () => {
    const STROKE_WIDTH = 3 // Stroke expansion width
    const PADDING = 0.5 // Padding as fraction of shape size
    const MAX_BITMAP = 256 // Max bitmap dimension
    const BASE_RESOLUTION = 4 // Pixels per unit (before capping)
    const EDGE_THRESHOLD = 0.5 // SDF value at shape edge
    const MIN_THRESHOLD = 0.05 // Minimum threshold (max expansion)
    const SCALE_MULTIPLIER = 1.5 // Boost scale effect

    try {
      // Expand path as stroke
      const strokeOffset = new ClipperOffset()
      strokeOffset.ArcTolerance = SCALE * PADDING
      strokeOffset.addPath(path, JoinType.Round, EndType.Round)
      const strokeResult = []
      strokeOffset.execute(SCALE * STROKE_WIDTH, strokeResult)

      // Use stroke result, or convex hull if stroke expansion failed
      let merged
      if (strokeResult.length > 0) {
        merged = Clipper.Union(strokeResult, null, FillRule.NonZero)
      } else {
        merged = [
          verticesConvex().map((p) => ({
            x: Math.round(p.x * SCALE),
            y: Math.round(p.y * SCALE),
          })),
        ]
      }

      if (merged.length === 0) return null

      // Compute bounds with padding
      const sdfBounds = merged.flat().reduce(
        (acc, pt) => ({
          minX: Math.min(acc.minX, pt.x / SCALE),
          maxX: Math.max(acc.maxX, pt.x / SCALE),
          minY: Math.min(acc.minY, pt.y / SCALE),
          maxY: Math.max(acc.maxY, pt.y / SCALE),
        }),
        { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity },
      )
      const sdfWidth = sdfBounds.maxX - sdfBounds.minX
      const sdfHeight = sdfBounds.maxY - sdfBounds.minY
      const padding = Math.max(sdfWidth, sdfHeight) * PADDING

      // Cap bitmap size to prevent stack overflow
      const maxDim = Math.max(sdfWidth, sdfHeight) + padding * 2
      const resolution = Math.min(BASE_RESOLUTION, MAX_BITMAP / maxDim)
      const bitmapWidth = Math.ceil((sdfWidth + padding * 2) * resolution)
      const bitmapHeight = Math.ceil((sdfHeight + padding * 2) * resolution)

      // Rasterize merged paths to bitmap
      const bitmap = new Uint8ClampedArray(bitmapWidth * bitmapHeight)
      const offsetX = -sdfBounds.minX + padding
      const offsetY = -sdfBounds.minY + padding

      for (const p of merged) {
        const scaledVerts = p.map((pt) => ({
          x: (pt.x / SCALE + offsetX) * resolution,
          y: (pt.y / SCALE + offsetY) * resolution,
        }))
        fillPolygonToBitmap(bitmap, bitmapWidth, bitmapHeight, scaledVerts)
      }

      // Compute SDF and extract contour
      const sdf = calcSdf(bitmap, {
        width: bitmapWidth,
        height: bitmapHeight,
        cutoff: EDGE_THRESHOLD,
        radius: bitmapWidth / 4,
      })

      // Threshold: edge value = tight, lower = further out
      const thresholdRange = EDGE_THRESHOLD - MIN_THRESHOLD
      const threshold = Math.max(
        EDGE_THRESHOLD - (scale / 100) * thresholdRange * SCALE_MULTIPLIER,
        MIN_THRESHOLD,
      )

      const contourResult = contours()
        .size([bitmapWidth, bitmapHeight])
        .thresholds([threshold])(sdf)

      if (contourResult.length > 0 && contourResult[0].coordinates.length > 0) {
        const rings = contourResult[0].coordinates
        const largestRing = rings.reduce((a, b) =>
          a[0].length > b[0].length ? a : b,
        )[0]

        // Convert bitmap coords back to original space
        const result = largestRing.map(([x, y]) => [
          (x / resolution + sdfBounds.minX - padding) * SCALE,
          (y / resolution + sdfBounds.minY - padding) * SCALE,
        ])
        result.sdfApplied = true
        return result
      }
    } catch {
      // SDF failed
    }

    return null
  }

  // Fill pattern approach for shapes with many small disconnected cells
  // (Voronoi, TessellationTwist). Concaveman fails on these (creates zigzags).
  // Uses bounding box for rectangular patterns, convex hull for polygonal.
  const traceFillPattern = () => {
    const RECTANGULAR_THRESHOLD = 0.85 // Above this = use bounding box

    const bboxArea = inputWidth * inputHeight
    const convexArea = Math.abs(polygonArea(convex))
    const fillRatio = convexArea / (bboxArea * SCALE * SCALE)

    if (fillRatio > RECTANGULAR_THRESHOLD) {
      const result = [
        [bounds[0].x * SCALE, bounds[0].y * SCALE],
        [bounds[1].x * SCALE, bounds[0].y * SCALE],
        [bounds[1].x * SCALE, bounds[1].y * SCALE],
        [bounds[0].x * SCALE, bounds[1].y * SCALE],
        [bounds[0].x * SCALE, bounds[0].y * SCALE],
      ]
      result.bboxCenter = {
        x: (bounds[0].x + bounds[1].x) / 2,
        y: (bounds[0].y + bounds[1].y) / 2,
      }
      return result
    } else {
      return verticesConvex().map((p) => [p.x * SCALE, p.y * SCALE])
    }
  }

  // Select algorithm based on shape type
  if (useSdf) {
    hull = traceSdf() || hull
  } else if (isFillPattern || (boundary.length > 1 && !useSdf)) {
    hull = traceFillPattern()
  }

  // Apply centroid scaling (skip if SDF already applied scale via threshold)
  if (scale !== 0 && hull.length > 0 && !hull.sdfApplied) {
    const center = hull.bboxCenter || centroid(vertices)
    const cx = center.x * SCALE
    const cy = center.y * SCALE
    const scaleFactor = 1 + scale / 100
    hull = hull.map(([x, y]) => [
      cx + (x - cx) * scaleFactor,
      cy + (y - cy) * scaleFactor,
    ])
  }

  return hull.map(([x, y]) => new Victor(x / SCALE, y / SCALE))
}
