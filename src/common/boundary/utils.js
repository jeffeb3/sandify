import { contours } from "d3-contour"
import { centroid } from "@/common/geometry"

// ------------------------------
// Constants
// ------------------------------

export const CLIPPER_SCALE = 1000 // Clipper2 scale factor (float -> int conversion)

// Edge offset constants
const PARALLEL_TOLERANCE = 0.0001 // Tolerance for parallel line detection
const SPIKE_CLAMP_MULTIPLIER = 3 // Max distance = offset * this (prevents spikes)

// Bitmap/SDF constants
export const BITMAP_SIZE_LARGE = 1024 // Bitmap size for fine detail (scale <= 10)
export const BITMAP_SIZE_SMALL = 512 // Bitmap size for large borders (scale > 10)
export const BITMAP_SCALE_THRESHOLD = 10 // Scale value that switches bitmap size
export const SMOOTH_RADIUS_FRACTION = 0.15 // Fraction of stroke width for smoothing

// ------------------------------
// Centroid scaling
// ------------------------------

// Apply centroid-based scaling to a hull (in CLIPPER_SCALE units).
// Used for expand/convex algorithms where we scale from center rather than edge offset.
export const applyCentroidScale = (hull, vertices, scale) => {
  if (scale === 0 || hull.length === 0) return hull

  const center = centroid(vertices)
  const centerX = center.x * CLIPPER_SCALE
  const centerY = center.y * CLIPPER_SCALE
  const scaleFactor = 1 + scale / 100

  return hull.map(([x, y]) => [
    centerX + (x - centerX) * scaleFactor,
    centerY + (y - centerY) * scaleFactor,
  ])
}

// ------------------------------
// Bitmap utilities
// ------------------------------

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

// Stroke (draw outline of) a polygon into a bitmap using Bresenham's line algorithm
// Unlike fillPolygonToBitmap, this only draws the edges, not the interior
// thickness controls how wide the stroke is
export const strokePolygonToBitmap = (
  bitmap,
  width,
  height,
  vertices,
  thickness = 1,
) => {
  if (vertices.length < 2) return

  const halfThick = Math.floor(thickness / 2)
  const drawPoint = (x, y) => {
    for (let dy = -halfThick; dy <= halfThick; dy++) {
      for (let dx = -halfThick; dx <= halfThick; dx++) {
        const px = Math.round(x + dx)
        const py = Math.round(y + dy)
        if (px >= 0 && px < width && py >= 0 && py < height) {
          bitmap[py * width + px] = 255
        }
      }
    }
  }

  // Draw line between two points using Bresenham's algorithm
  const drawLine = (x0, y0, x1, y1) => {
    const dx = Math.abs(x1 - x0)
    const dy = Math.abs(y1 - y0)
    const sx = x0 < x1 ? 1 : -1
    const sy = y0 < y1 ? 1 : -1
    let err = dx - dy

    let x = x0
    let y = y0

    while (true) {
      drawPoint(x, y)

      if (Math.abs(x - x1) < 1 && Math.abs(y - y1) < 1) break

      const e2 = 2 * err
      if (e2 > -dy) {
        err -= dy
        x += sx
      }
      if (e2 < dx) {
        err += dx
        y += sy
      }
    }
  }

  // Draw all edges - but DON'T close the path
  // Closing creates a long segment from last to first vertex which,
  // when stroked thickly, fills across the shape interior
  for (let i = 0; i < vertices.length - 1; i++) {
    const v1 = vertices[i]
    const v2 = vertices[i + 1]

    drawLine(v1.x, v1.y, v2.x, v2.y)
  }
}

// Grows white pixels outward by the given radius (morphological dilation).
// Each white pixel "spreads" to fill a circle around it,
// which merges nearby strokes and fills small gaps.
export const dilate = (bitmap, width, height, radius) => {
  if (radius < 1) return bitmap

  const result = new Uint8ClampedArray(width * height)
  const offsets = []

  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      if (dx * dx + dy * dy <= radius * radius) {
        offsets.push({ dx, dy })
      }
    }
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let maxVal = 0
      for (const { dx, dy } of offsets) {
        const nx = x + dx
        const ny = y + dy

        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          maxVal = Math.max(maxVal, bitmap[ny * width + nx])
        }
      }
      result[y * width + x] = maxVal
    }
  }

  return result
}

// ------------------------------
// Edge offset
// ------------------------------

// Apply uniform edge offset to a hull polygon.
// Used by the "concave" algorithm to expand/contract the boundary.
// Handles deep concavities by falling back to raster dilation.
//
// hull: array of [x, y] points in CLIPPER_SCALE units
// scale: percentage to expand (positive) or contract (negative)
// vertices: original shape vertices (for centroid calculation)
// Returns: offset hull as [[x, y], ...] in CLIPPER_SCALE units, or null if no offset needed
export const applyEdgeOffset = (hull, scale, vertices) => {
  if (scale === 0 || hull.length === 0) {
    return null
  }

  // First dedupe consecutive points
  const dedupedHull = []

  for (let i = 0; i < hull.length; i++) {
    const [x, y] = hull[i]

    if (dedupedHull.length > 0) {
      const [px, py] = dedupedHull[dedupedHull.length - 1]

      if (Math.abs(x - px) < 1 && Math.abs(y - py) < 1) continue
    }
    dedupedHull.push([x, y])
  }

  // Remove last if same as first
  if (dedupedHull.length > 2) {
    const [fx, fy] = dedupedHull[0]
    const [lx, ly] = dedupedHull[dedupedHull.length - 1]

    if (Math.abs(fx - lx) < 1 && Math.abs(fy - ly) < 1) {
      dedupedHull.pop()
    }
  }

  const hullBounds = dedupedHull.reduce(
    (acc, [x, y]) => ({
      minX: Math.min(acc.minX, x),
      maxX: Math.max(acc.maxX, x),
      minY: Math.min(acc.minY, y),
      maxY: Math.max(acc.maxY, y),
    }),
    { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity },
  )
  const smallerDim = Math.min(
    hullBounds.maxX - hullBounds.minX,
    hullBounds.maxY - hullBounds.minY,
  )
  const d = ((scale / 100) * smallerDim) / 2
  const n = dedupedHull.length

  if (n < 3) {
    return null
  }

  // Compute signed area to determine winding
  let signedArea = 0
  for (let i = 0; i < n; i++) {
    const [x1, y1] = dedupedHull[i]
    const [x2, y2] = dedupedHull[(i + 1) % n]
    signedArea += x1 * y2 - x2 * y1
  }

  // signedArea > 0 means CCW in standard math coords
  const ccw = signedArea > 0
  let hasDeepConcavity = false

  // Check for deep concavity - if found, fall back to raster dilation
  for (let i = 0; i < n; i++) {
    const [x0, y0] = dedupedHull[(i - 1 + n) % n]
    const [x1, y1] = dedupedHull[i]
    const [x2, y2] = dedupedHull[(i + 1) % n]
    const v1x = x0 - x1,
      v1y = y0 - y1
    const v2x = x2 - x1,
      v2y = y2 - y1
    const cross = v1x * v2y - v1y * v2x
    const dot = v1x * v2x + v1y * v2y
    const angle = Math.atan2(Math.abs(cross), dot)
    const isConcave = ccw ? cross < 0 : cross > 0

    if (isConcave && angle < Math.PI / 2) {
      hasDeepConcavity = true
      break
    }
  }

  if (hasDeepConcavity) {
    return applyEdgeOffsetRaster(dedupedHull, scale, smallerDim, vertices)
  }

  // Compute outward normal for each edge
  const normals = []

  for (let i = 0; i < n; i++) {
    const [x1, y1] = dedupedHull[i]
    const [x2, y2] = dedupedHull[(i + 1) % n]
    const dx = x2 - x1
    const dy = y2 - y1
    const len = Math.sqrt(dx * dx + dy * dy)

    if (len > 0) {
      const nx = ccw ? dy / len : -dy / len
      const ny = ccw ? -dx / len : dx / len
      normals.push([nx, ny])
    } else {
      normals.push([0, 0])
    }
  }

  // For each vertex, find intersection of adjacent offset edges
  const offsetHull = []

  for (let i = 0; i < n; i++) {
    const prevIdx = (i - 1 + n) % n
    const [v0x, v0y] = dedupedHull[prevIdx]
    const [v1x, v1y] = dedupedHull[i]
    const [v2x, v2y] = dedupedHull[(i + 1) % n]
    const [n0x, n0y] = normals[prevIdx]
    const [n1x, n1y] = normals[i]
    const p0x = v0x + n0x * d
    const p0y = v0y + n0y * d
    const d0x = v1x - v0x
    const d0y = v1y - v0y
    const p1x = v1x + n1x * d
    const p1y = v1y + n1y * d
    const d1x = v2x - v1x
    const d1y = v2y - v1y

    const denom = d0x * d1y - d0y * d1x
    const avgNx = (n0x + n1x) / 2
    const avgNy = (n0y + n1y) / 2
    const avgLen = Math.sqrt(avgNx * avgNx + avgNy * avgNy)

    let newX, newY

    if (Math.abs(denom) < PARALLEL_TOLERANCE) {
      if (avgLen > 0) {
        newX = v1x + (avgNx / avgLen) * d
        newY = v1y + (avgNy / avgLen) * d
      } else {
        newX = v1x
        newY = v1y
      }
    } else {
      const t = ((p1x - p0x) * d1y - (p1y - p0y) * d1x) / denom

      newX = p0x + t * d0x
      newY = p0y + t * d0y
    }

    // Clamp to prevent spikes at deeply concave vertices
    const maxDist = d * SPIKE_CLAMP_MULTIPLIER
    const distFromOriginal = Math.sqrt((newX - v1x) ** 2 + (newY - v1y) ** 2)

    if (distFromOriginal > maxDist && avgLen > 0) {
      newX = v1x + (avgNx / avgLen) * maxDist
      newY = v1y + (avgNy / avgLen) * maxDist
    }

    offsetHull.push([newX, newY])
  }

  return offsetHull
}

// Raster-based edge offset for hulls with deep concavities.
// Uses bitmap dilation + contour extraction for accurate results.
const applyEdgeOffsetRaster = (dedupedHull, scale, smallerDim, vertices) => {
  const DILATION_SCALE_THRESHOLD = 10
  const useThresholdDilation = scale > DILATION_SCALE_THRESHOLD
  const dilationScale = useThresholdDilation ? DILATION_SCALE_THRESHOLD : scale
  const dilationD = ((dilationScale / 100) * smallerDim) / 2
  const BITMAP_SIZE = 512
  const MAX_CONTOUR_POINTS = 1000
  const worldHull = dedupedHull.map(([x, y]) => ({
    x: x / CLIPPER_SCALE,
    y: y / CLIPPER_SCALE,
  }))
  const hullWorldBounds = worldHull.reduce(
    (acc, v) => ({
      minX: Math.min(acc.minX, v.x),
      maxX: Math.max(acc.maxX, v.x),
      minY: Math.min(acc.minY, v.y),
      maxY: Math.max(acc.maxY, v.y),
    }),
    { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity },
  )
  const worldD = dilationD / CLIPPER_SCALE
  const padding = worldD * 2
  const worldWidth = hullWorldBounds.maxX - hullWorldBounds.minX + padding * 2
  const worldHeight = hullWorldBounds.maxY - hullWorldBounds.minY + padding * 2
  const bitmapScale = BITMAP_SIZE / Math.max(worldWidth, worldHeight)
  const bitmapWidth = Math.ceil(worldWidth * bitmapScale)
  const bitmapHeight = Math.ceil(worldHeight * bitmapScale)
  const bitmapHull = worldHull.map((v) => ({
    x: (v.x - hullWorldBounds.minX + padding) * bitmapScale,
    y: (v.y - hullWorldBounds.minY + padding) * bitmapScale,
  }))
  const bitmap = new Uint8ClampedArray(bitmapWidth * bitmapHeight)

  fillPolygonToBitmap(bitmap, bitmapWidth, bitmapHeight, bitmapHull)

  const dilateRadius = Math.max(1, Math.round(worldD * bitmapScale))
  const dilatedBitmap = dilate(bitmap, bitmapWidth, bitmapHeight, dilateRadius)
  const maskFloat = new Float64Array(bitmapWidth * bitmapHeight)

  for (let i = 0; i < dilatedBitmap.length; i++) {
    maskFloat[i] = dilatedBitmap[i] > 127 ? 1.0 : 0.0
  }

  const contourResult = contours()
    .size([bitmapWidth, bitmapHeight])
    .thresholds([0.5])(maskFloat)

  if (contourResult.length > 0 && contourResult[0].coordinates.length > 0) {
    const rings = contourResult[0].coordinates
    let largestRing = rings[0][0]
    let largestLen = 0

    for (const ring of rings) {
      if (ring[0].length > largestLen) {
        largestLen = ring[0].length
        largestRing = ring[0]
      }
    }

    let offsetPoints = largestRing.map(([x, y]) => [
      (x / bitmapScale + hullWorldBounds.minX - padding) * CLIPPER_SCALE,
      (y / bitmapScale + hullWorldBounds.minY - padding) * CLIPPER_SCALE,
    ])

    if (offsetPoints.length > MAX_CONTOUR_POINTS) {
      const step = Math.ceil(offsetPoints.length / MAX_CONTOUR_POINTS)
      offsetPoints = offsetPoints.filter((_, i) => i % step === 0)
    }

    // If scale > threshold, centroid-scale the dilated result
    if (useThresholdDilation) {
      const center = centroid(vertices)
      const centerX = center.x * CLIPPER_SCALE
      const centerY = center.y * CLIPPER_SCALE
      const scaleFactor =
        (1 + scale / 100) / (1 + DILATION_SCALE_THRESHOLD / 100)

      offsetPoints = offsetPoints.map(([x, y]) => [
        centerX + (x - centerX) * scaleFactor,
        centerY + (y - centerY) * scaleFactor,
      ])
    }

    return offsetPoints
  }

  // Dilation failed - fall back to pure centroid scaling
  return applyCentroidScale(dedupedHull, vertices, scale)
}
