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

const DEBUG = false // Set to true to debug SDF detection

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
    console.log("[traceBoundary] decision:", {
      boundaryPaths: boundary.length,
      ratio: ratio.toFixed(2),
      pointsPerPath: pointsPerPath.toFixed(1),
      isOpenPath,
      isFillPattern,
      useSdf,
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
    const NORMALIZED_SIZE = 100 // Normalize shape to this size for consistent resolution
    const STROKE_WIDTH_BASE = 3 // Base stroke expansion width (in normalized units)
    // Multi-path shapes (like text) need more stroke to merge separate components
    const STROKE_WIDTH = boundary.length > 1 ? STROKE_WIDTH_BASE * 2 : STROKE_WIDTH_BASE
    const PADDING = 0.5 // Padding as fraction of shape size
    const BITMAP_SIZE = 256 // Fixed bitmap size for normalized shape
    const MAX_BITMAP_DIM = 512 // Cap bitmap dimensions to prevent performance issues
    const MAX_INPUT_VERTICES = 5000 // Skip SDF for very complex shapes
    const MAX_CONTOUR_POINTS = 2000 // Downsample contour if too many points
    const EDGE_THRESHOLD = 0.5 // SDF value at shape edge
    const MIN_THRESHOLD = 0.05 // Minimum threshold (max expansion)
    const SCALE_MULTIPLIER = 1.5 // Boost scale effect

    // Early exit if input is too complex - fall back to concaveman
    if (vertices.length > MAX_INPUT_VERTICES) {
      if (DEBUG) console.log("[traceSdf] skipping - too many input vertices:", vertices.length)
      return null
    }

    if (DEBUG) console.log("[traceSdf] starting...", { boundaryPaths: boundary.length, strokeWidth: STROKE_WIDTH, inputVertices: vertices.length })

    try {
      // Calculate normalization factor to bring shape to standard size
      const originalMaxDim = Math.max(inputWidth, inputHeight)
      const normFactor = originalMaxDim > 0 ? NORMALIZED_SIZE / originalMaxDim : 1

      // Create normalized path for stroke expansion
      let normalizedPath = new Path64()
      for (const v of vertices) {
        normalizedPath.push({
          x: Math.round(v.x * normFactor * SCALE),
          y: Math.round(v.y * normFactor * SCALE),
        })
      }

      // Simplify path using Douglas-Peucker if too many vertices
      const MAX_OFFSET_VERTICES = 500
      if (normalizedPath.length > MAX_OFFSET_VERTICES) {
        // epsilon controls simplification aggressiveness (in scaled units)
        const epsilon = SCALE * 1.0 // 1.0 normalized units tolerance
        normalizedPath = Clipper.simplifyPath(normalizedPath, epsilon, false)
        if (DEBUG) console.log("[traceSdf] simplified path from", vertices.length, "to", normalizedPath.length, "vertices")

        // If still too many after simplification, bail out
        if (normalizedPath.length > MAX_OFFSET_VERTICES) {
          if (DEBUG) console.log("[traceSdf] still too complex after simplification, bailing")
          return null
        }
      }

      // Expand path as stroke (in normalized space)
      const strokeOffset = new ClipperOffset()
      strokeOffset.ArcTolerance = SCALE * 1.0 // Moderate arc tolerance for balance of speed/quality
      strokeOffset.addPath(normalizedPath, JoinType.Round, EndType.Round)
      const strokeResult = []
      strokeOffset.execute(SCALE * STROKE_WIDTH, strokeResult)

      // Use stroke result, or convex hull if stroke expansion failed
      let merged
      if (strokeResult.length > 0) {
        merged = Clipper.Union(strokeResult, null, FillRule.NonZero)
      } else {
        merged = [
          verticesConvex().map((p) => ({
            x: Math.round(p.x * normFactor * SCALE),
            y: Math.round(p.y * normFactor * SCALE),
          })),
        ]
      }

      if (merged.length === 0) return null

      // Check total point count in merged paths - bail if too large
      const totalMergedPoints = merged.reduce((sum, p) => sum + p.length, 0)
      if (totalMergedPoints > MAX_INPUT_VERTICES * 2) {
        if (DEBUG) console.log("[traceSdf] merged paths too complex, bailing")
        return null
      }

      // Compute bounds with padding (in normalized space)
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

      // Fixed resolution for normalized space
      const maxDim = Math.max(sdfWidth, sdfHeight, 1) + padding * 2 // min 1 to avoid division issues
      const resolution = BITMAP_SIZE / maxDim
      const bitmapWidth = Math.min(MAX_BITMAP_DIM, Math.ceil((sdfWidth + padding * 2) * resolution))
      const bitmapHeight = Math.min(MAX_BITMAP_DIM, Math.ceil((sdfHeight + padding * 2) * resolution))

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

      // Threshold: higher = tighter (inside stroke), lower = further out
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
        const ringSizes = rings.map(r => r[0].length).sort((a, b) => b - a)
        if (DEBUG) console.log("[traceSdf] rings:", rings.length, "sizes:", ringSizes)

        // If multiple rings and largest is much bigger than rest, it's likely
        // the outer bitmap boundary (letters didn't merge) - fall back to concaveman
        if (rings.length > 1 && ringSizes[0] > ringSizes[1] * 4) {
          if (DEBUG) console.log("[traceSdf] largest ring appears to be bitmap boundary, falling back")
          return null
        }

        const largestRing = rings.reduce((a, b) =>
          a[0].length > b[0].length ? a : b,
        )[0]

        // Convert bitmap coords back to original space (undo normalization)
        let rawPoints = largestRing.map(([x, y]) => [
          ((x / resolution + sdfBounds.minX - padding) / normFactor) * SCALE,
          ((y / resolution + sdfBounds.minY - padding) / normFactor) * SCALE,
        ])

        // Downsample if too many points to prevent concaveman from hanging
        if (rawPoints.length > MAX_CONTOUR_POINTS) {
          const step = Math.ceil(rawPoints.length / MAX_CONTOUR_POINTS)
          rawPoints = rawPoints.filter((_, i) => i % step === 0)
          if (DEBUG) console.log("[traceSdf] downsampled contour from", largestRing.length, "to", rawPoints.length)
        }

        // Smooth the SDF contour using concaveman to remove marching squares artifacts
        // This creates a cleaner boundary for polygon clipping
        const smoothed = concaveman(rawPoints, 1.0)
        smoothed.sdfApplied = true
        if (DEBUG) console.log("[traceSdf] success, smoothed:", smoothed.length, "points")
        return smoothed
      }
      if (DEBUG) console.log("[traceSdf] no contour result")
    } catch (e) {
      if (DEBUG) console.log("[traceSdf] error:", e.message)
    }

    if (DEBUG) console.log("[traceSdf] returning null (fallback to concaveman)")
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
