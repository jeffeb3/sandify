/**
 * Boundary Algorithm: Footprint (SDF-based)
 *
 * Strokes the original pen path to a bitmap, then uses signed distance field (SDF)
 * contour extraction. Handles complex geometry that defeats hull-based approaches.
 *
 * Used by: FancyText (multi-path letters), FractalSpirograph (many short segments),
 * LSystem (very high complexity ratio), Maze (dense single-path patterns).
 *
 * Characteristics that trigger this algorithm:
 *   - Multi-path shapes with ratio > 3 (text-like)
 *   - Open paths with ratio >= 2 or degenerate geometry
 *   - Single-path shapes with very high ratio > 40 (lsystem-like)
 */
import concaveman from "concaveman"
import calcSdf from "bitmap-sdf"
import { contours } from "d3-contour"
import { distance, pointInPolygon } from "@/common/geometry"
import {
  CLIPPER_SCALE,
  BITMAP_SIZE_LARGE,
  BITMAP_SIZE_SMALL,
  BITMAP_SCALE_THRESHOLD,
  SMOOTH_RADIUS_FRACTION,
  strokePolygonToBitmap,
  dilate,
} from "./utils"

// Ink Footprint: stroke original pen path directly to bitmap, then SDF.
// Preserves concave details that get lost when boundary regions merge.
export const traceFootprintBoundary = (ctx) => {
  const { vertices, bounds, inputWidth, inputHeight, scale } = ctx

  // Reduce resolution at higher scales - don't need fine detail for large borders
  const BITMAP_SIZE =
    scale > BITMAP_SCALE_THRESHOLD ? BITMAP_SIZE_SMALL : BITMAP_SIZE_LARGE

  // Dynamic padding: more padding at higher scale values to allow expansion
  // scale=0% -> 10% padding (max resolution), scale=100% -> 60% padding (room for expansion)
  const PADDING_RATIO = 0.1 + (scale / 100) * 0.5
  const MAX_CONTOUR_POINTS = 2000
  const EDGE_THRESHOLD = 0.5 // SDF value at shape edge

  try {
    // Compute stroke width based on path statistics (in world units)
    const segments = []

    for (let i = 1; i < vertices.length; i++) {
      segments.push(distance(vertices[i], vertices[i - 1]))
    }
    segments.sort((a, b) => a - b)

    const ds_med =
      segments.length > 0 ? segments[Math.floor(segments.length / 2)] : 1
    const D = Math.max(inputWidth, inputHeight, 1)

    // World-space base width: clamp between 0.5% and 2% of bbox diagonal
    const k = 3
    const w_world_min = 0.005 * D
    const w_world_max = 0.02 * D
    const w_world_base = Math.max(
      w_world_min,
      Math.min(k * ds_med, w_world_max),
    )

    // Add scale-based expansion to stroke width for uniform border growth
    const smallerDim = Math.min(inputWidth, inputHeight)
    const scaleExpansion = ((scale / 100) * smallerDim) / 2
    const w_world = w_world_base + scaleExpansion

    // Setup bitmap with padding
    const padding = Math.max(inputWidth, inputHeight) * PADDING_RATIO
    const bitmapWidth = BITMAP_SIZE
    const bitmapHeight = Math.round(
      (BITMAP_SIZE * (inputHeight + 2 * padding)) / (inputWidth + 2 * padding),
    )

    // Scale factor: world coords to bitmap coords
    const scaleX = bitmapWidth / (inputWidth + 2 * padding)
    const scaleY = bitmapHeight / (inputHeight + 2 * padding)
    const bitmapScale = Math.min(scaleX, scaleY)

    // Stroke width in bitmap pixels (floor of 2px minimum)
    const w_px = Math.max(2, Math.round(w_world * bitmapScale))

    // Transform vertices to bitmap space
    const bitmapVertices = vertices.map((v) => ({
      x: (v.x - bounds[0].x + padding) * bitmapScale,
      y: (v.y - bounds[0].y + padding) * bitmapScale,
    }))

    // Stroke the original pen path directly to bitmap.
    // The stroke width creates the "ink footprint" of the tool path.
    const bitmap = new Uint8ClampedArray(bitmapWidth * bitmapHeight)

    // Stroke the original vertices - this is the actual pen path
    strokePolygonToBitmap(
      bitmap,
      bitmapWidth,
      bitmapHeight,
      bitmapVertices,
      w_px,
    )

    // Small dilation to smooth edges and merge filled regions with strokes
    const SMOOTH_RADIUS = Math.max(2, Math.round(w_px * SMOOTH_RADIUS_FRACTION))
    const finalBitmap = dilate(bitmap, bitmapWidth, bitmapHeight, SMOOTH_RADIUS)

    // Compute SDF on dilated bitmap
    const sdf = calcSdf(finalBitmap, {
      width: bitmapWidth,
      height: bitmapHeight,
      cutoff: EDGE_THRESHOLD,
      radius: Math.max(bitmapWidth, bitmapHeight) / 4,
    })

    // Extract contour at fixed threshold (tight to shape)
    // Scaling is applied via centroid scaling after extraction for linear behavior
    const contourResult = contours()
      .size([bitmapWidth, bitmapHeight])
      .thresholds([EDGE_THRESHOLD])(sdf)

    if (
      contourResult.length === 0 ||
      contourResult[0].coordinates.length === 0
    ) {
      return null
    }

    // Get the SDF contour ring
    const rings = contourResult[0].coordinates
    let largestRing = rings[0][0]
    let largestArea = 0

    for (const ring of rings) {
      const pts = ring[0]
      let area = 0

      for (let j = 0; j < pts.length; j++) {
        const k = (j + 1) % pts.length

        area += pts[j][0] * pts[k][1]
        area -= pts[k][0] * pts[j][1]
      }
      area = Math.abs(area / 2)
      if (area > largestArea) {
        largestArea = area
        largestRing = pts
      }
    }

    // The contour may shortcut through interior bays (like S flourish)
    // Detect this by finding vertices that are OUTSIDE the contour polygon.
    // The bay is "open to exterior" so the contour shortcuts past flourish vertices.

    // Find vertices that are OUTSIDE the contour polygon
    // These are vertices the contour is shortcutting past
    const outsideVertices = []

    for (const v of bitmapVertices) {
      if (!pointInPolygon(v.x, v.y, largestRing)) {
        outsideVertices.push([v.x, v.y])
      }
    }

    let finalRing

    if (outsideVertices.length === 0) {
      // All vertices inside contour - use it directly
      finalRing = largestRing
    } else {
      // Some vertices outside contour - contour is shortcutting past them
      // Add outside vertices to contour and re-wrap with concaveman
      const allPoints = [...largestRing, ...outsideVertices]

      finalRing = concaveman(allPoints, 2.0, 0)
    }

    // Convert bitmap coords back to world coords (then to CLIPPER_SCALE units for output)
    let rawPoints = finalRing.map(([x, y]) => [
      (x / bitmapScale + bounds[0].x - padding) * CLIPPER_SCALE,
      (y / bitmapScale + bounds[0].y - padding) * CLIPPER_SCALE,
    ])

    // Downsample if too many points
    if (rawPoints.length > MAX_CONTOUR_POINTS) {
      const step = Math.ceil(rawPoints.length / MAX_CONTOUR_POINTS)

      rawPoints = rawPoints.filter((_, i) => i % step === 0)
    }

    // Note: scaling is done via stroke width expansion, not centroid scaling
    // This gives uniform border growth that doesn't overlap the shape
    return rawPoints
  } catch {
    // SDF/contour extraction failed; falls back to initial hull
    return null
  }
}
