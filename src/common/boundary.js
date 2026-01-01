import Victor from "victor"
import { Clipper, FillRule, Path64 } from "clipper2-js"
import convexHull from "convexhull-js"
import concaveman from "concaveman"
import calcSdf from "bitmap-sdf"
import { contours } from "d3-contour"
import {
  findBounds,
  distance,
  centroid,
  pointInPolygon,
  polygonArea,
} from "./geometry"

// Detection thresholds for algorithm selection
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
const SCALE = 1000

// Algorithm name to numeric value mapping for traceBoundary
// null = auto, 0 = concave, 1 = expand, 2 = footprint, 3 = convex
export const boundaryAlgorithmMap = {
  auto: null,
  expand: 1,
  concave: 0,
  footprint: 2,
  convex: 3,
}

export const boundaryAlgorithmChoices = Object.keys(boundaryAlgorithmMap)

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
const strokePolygonToBitmap = (
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
const dilate = (bitmap, width, height, radius) => {
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

// Analyze vertices and determine which border algorithm to use.
export const boundaryAlgorithm = (vertices) => {
  if (vertices.length < 3) {
    return {
      algorithm: "expand",
      reason: "too few vertices",
      boundaryPaths: 0,
      ratio: 0,
      pointsPerPath: 0,
      isOpenPath: false,
      isFillPattern: false,
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
    path.push({ x: Math.round(v.x * SCALE), y: Math.round(v.y * SCALE) })
  }

  let boundary = Clipper.Union([path], null, FillRule.NonZero)

  if (boundary.length === 0) {
    return {
      algorithm: "expand",
      reason: "no boundary",
      boundaryPaths: 0,
      ratio: 0,
      pointsPerPath: 0,
      isOpenPath,
      isFillPattern: false,
    }
  }

  // Filter out degenerate paths
  const inputArea = inputWidth * inputHeight * SCALE * SCALE
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

  // Footprint needed for:
  //   Multi-path with high ratio (but not fill patterns)
  //   Open fractals (single path, open, moderate ratio)
  //   Very high ratio single-path (lsystem with ratio 54)
  //   Open paths with degenerate Clipper results (zero-area paths from precision issues)
  // Moderate-ratio single-path closed shapes (Maze, Hypocycloid) use expand
  const hasZeroAreaPaths = maxArea < minArea // Very small area indicates degenerate geometry
  const hasDegenerateRatio = ratio <= 1 // Hull collapsed to convex hull
  const useFootprint =
    (boundary.length > 1 && ratio > SDF_RATIO_MULTI && !isFillPattern) ||
    (isOpenPath &&
      boundary.length === 1 &&
      (ratio >= SDF_RATIO_OPEN || hasDegenerateRatio)) ||
    (isOpenPath &&
      boundary.length > 1 &&
      (hasZeroAreaPaths || hasDegenerateRatio)) || // Degenerate open path
    (boundary.length === 1 && ratio > SDF_RATIO_VERY_HIGH)

  // Determine algorithm
  let algorithm, reason

  if (useFootprint) {
    algorithm = "footprint"
    reason =
      ratio > SDF_RATIO_VERY_HIGH
        ? "very high ratio"
        : boundary.length > 1
          ? "multi-path"
          : "open path"
  } else if (isFillPattern) {
    algorithm = "concave"
    reason = "fill pattern"
  } else {
    algorithm = "expand"
    reason = "simple closed shape"
  }

  return {
    algorithm,
    reason,
    boundaryPaths: boundary.length,
    ratio: Math.round(ratio * 100) / 100,
    pointsPerPath: Math.round(pointsPerPath * 10) / 10,
    allPointsCount: allPoints.length,
    isOpenPath,
    isFillPattern,
    largestDominates,
  }
}

// Apply uniform edge offset to a hull polygon.
// Used by the "concave" algorithm to expand/contract the boundary.
// Handles deep concavities by falling back to raster dilation.
//
// hull: array of [x, y] points in SCALE units
// scale: percentage to expand (positive) or contract (negative)
// vertices: original shape vertices (for centroid calculation)
// Returns: offset hull as [[x, y], ...] in SCALE units, or null if no offset needed
const applyEdgeOffset = (hull, scale, vertices) => {
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

    if (Math.abs(denom) < 0.0001) {
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
    const maxDist = d * 3
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
    x: x / SCALE,
    y: y / SCALE,
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
  const worldD = dilationD / SCALE
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
      (x / bitmapScale + hullWorldBounds.minX - padding) * SCALE,
      (y / bitmapScale + hullWorldBounds.minY - padding) * SCALE,
    ])

    if (offsetPoints.length > MAX_CONTOUR_POINTS) {
      const step = Math.ceil(offsetPoints.length / MAX_CONTOUR_POINTS)
      offsetPoints = offsetPoints.filter((_, i) => i % step === 0)
    }

    // If scale > threshold, centroid-scale the dilated result
    if (useThresholdDilation) {
      const center = centroid(vertices)
      const centerX = center.x * SCALE
      const centerY = center.y * SCALE
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
  const center = centroid(vertices)
  const centerX = center.x * SCALE
  const centerY = center.y * SCALE
  const scaleFactor = 1 + scale / 100

  return dedupedHull.map(([x, y]) => [
    centerX + (x - centerX) * scaleFactor,
    centerY + (y - centerY) * scaleFactor,
  ])
}

// Extract the outer boundary of a shape for border tracing.
// Handles self-intersecting paths, fill patterns, and complex shapes.
//
// Algorithm selection based on shape characteristics:
//   Simple closed shapes (Star, Heart): concaveman hull
//   Complex/open shapes (fractals, text): SDF contour extraction
//   Fill patterns (Voronoi, TessellationTwist): bounding box or convex hull
//
// algorithm parameter:
//   null: Auto-detect based on shape characteristics
//   0: Concave (concaveman hull + edge offset for scale)
//   1: Expand (concaveman hull + centroid scale)
//   2: Footprint (stroke path to bitmap, SDF, contour)
export const traceBoundary = (vertices, scale = 0, algorithm = null) => {
  if (vertices.length < 3) {
    return [...vertices]
  }

  const detection = boundaryAlgorithm(vertices)
  const { isFillPattern, largestDominates } = detection
  const useFootprint =
    algorithm === 2 ||
    (algorithm === null && detection.algorithm === "footprint")
  const bounds = findBounds(vertices)
  const inputWidth = bounds[1].x - bounds[0].x
  const inputHeight = bounds[1].y - bounds[0].y
  const path = new Path64()

  for (const v of vertices) {
    path.push({ x: Math.round(v.x * SCALE), y: Math.round(v.y * SCALE) })
  }

  let boundary = Clipper.Union([path], null, FillRule.NonZero)

  if (boundary.length === 0) {
    // Fallback to convex hull when Clipper fails (e.g., twisted tessellation)
    const fallbackHull = convexHull(vertices.map((v) => ({ x: v.x, y: v.y })))

    if (scale !== 0 && fallbackHull.length > 0) {
      const center = centroid(vertices)
      const scaleFactor = 1 + scale / 100

      return fallbackHull.map(
        (v) =>
          new Victor(
            center.x + (v.x - center.x) * scaleFactor,
            center.y + (v.y - center.y) * scaleFactor,
          ),
      )
    }

    return fallbackHull.map((v) => new Victor(v.x, v.y))
  }

  // Filter out degenerate paths
  const inputArea = inputWidth * inputHeight * SCALE * SCALE
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

  // Determine which boundary paths to use
  const pathAreas = boundary.map((p) => Math.abs(Clipper.area(p)))
  const sortedAreas = [...pathAreas].sort((a, b) => b - a)
  const maxArea = sortedAreas[0]
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

  // Compute convex hull for traceFillPattern
  const allPoints = boundary.flatMap((p) => p.map((pt) => [pt.x, pt.y]))
  const convex = convexHull(allPoints.map(([x, y]) => ({ x, y })))

  // Convex hull of original vertices - used when Clipper2 boundary
  // loses extreme points or stroke expansion fails
  const verticesConvex = () =>
    convexHull(vertices.map((v) => ({ x: v.x, y: v.y })))

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

  // Ink Footprint: stroke original pen path directly to bitmap, then SDF.
  // Preserves concave details that get lost when boundary regions merge.
  const traceInkFootprint = () => {
    // Reduce resolution at higher scales - don't need fine detail for large borders
    const BITMAP_SIZE = scale > 10 ? 512 : 1024

    // Dynamic padding: more padding at higher scale values to allow expansion
    // scale=0% → 10% padding (max resolution), scale=100% → 60% padding (room for expansion)
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
        (BITMAP_SIZE * (inputHeight + 2 * padding)) /
          (inputWidth + 2 * padding),
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
      const SMOOTH_RADIUS = Math.max(2, Math.round(w_px * 0.15))
      const finalBitmap = dilate(
        bitmap,
        bitmapWidth,
        bitmapHeight,
        SMOOTH_RADIUS,
      )

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

      // Convert bitmap coords back to world coords (then to SCALE units for output)
      let rawPoints = finalRing.map(([x, y]) => [
        (x / bitmapScale + bounds[0].x - padding) * SCALE,
        (y / bitmapScale + bounds[0].y - padding) * SCALE,
      ])

      // Downsample if too many points
      if (rawPoints.length > MAX_CONTOUR_POINTS) {
        const step = Math.ceil(rawPoints.length / MAX_CONTOUR_POINTS)

        rawPoints = rawPoints.filter((_, i) => i % step === 0)
      }

      // Note: scaling is done via stroke width expansion, not centroid scaling
      // This gives uniform border growth that doesn't overlap the shape

      rawPoints.sdfApplied = true

      return rawPoints
    } catch {
      return null
    }
  }

  // Select algorithm based on parameter or auto-detect
  // Algorithm values: 0 = concave, 1 = expand, 2 = footprint, 3 = convex, null = auto
  // Auto-detect logic (when algorithm === null):
  // - footprint: complex shapes, multi-path text, open fractals
  // - concave: fill patterns (Voronoi, Tessellation)
  // - expand: simple closed shapes (Star, Heart, Circle, Polygon, etc.)
  const useExpand =
    algorithm === 1 || (algorithm === null && !useFootprint && !isFillPattern)
  const useConvex = algorithm === 3
  const useConcave = algorithm === 0
  const autoFillPattern = algorithm === null && isFillPattern && !useFootprint

  if (useFootprint) {
    hull = traceInkFootprint() || hull
  } else if (useConvex) {
    // Convex mode: use convex hull, apply centroid scale
    hull = convex.map((pt) => [pt.x, pt.y])

    if (scale !== 0 && hull.length > 0) {
      const center = centroid(vertices)
      const centerX = center.x * SCALE
      const centerY = center.y * SCALE
      const scaleFactor = 1 + scale / 100

      hull = hull.map(([x, y]) => [
        centerX + (x - centerX) * scaleFactor,
        centerY + (y - centerY) * scaleFactor,
      ])
    }
    hull.sdfApplied = true // Skip edge offset below
  } else if (useExpand) {
    // Expand mode: use concaveman hull (already computed), apply centroid scale
    // Mark as sdfApplied to skip edge offset math below
    if (scale !== 0 && hull.length > 0) {
      // Use original vertices' centroid for consistent positioning
      // Note: hull is in SCALE units (×1000), so convert centroid too
      const center = centroid(vertices)
      const centerX = center.x * SCALE
      const centerY = center.y * SCALE
      const scaleFactor = 1 + scale / 100

      hull = hull.map(([x, y]) => [
        centerX + (x - centerX) * scaleFactor,
        centerY + (y - centerY) * scaleFactor,
      ])
    }
    hull.sdfApplied = true // Skip edge offset below
  } else if (useConcave) {
    // Explicit concave: use concaveman hull (already computed), apply edge offset below
    // hull is already set from concaveman, just let it fall through to edge offset
  } else if (autoFillPattern || boundary.length > 1) {
    // Auto-detected fill patterns or multi-boundary shapes
    hull = traceFillPattern()
  }

  // Apply edge offset for concave algorithm (skip if already handled by SDF)
  if (!hull.sdfApplied) {
    const offsetHull = applyEdgeOffset(hull, scale, vertices)

    if (offsetHull) {
      hull = offsetHull
    }
  }

  const result = hull.map(([x, y]) => new Victor(x / SCALE, y / SCALE))

  if (hull.sdfApplied) result.sdfApplied = true

  result.algorithm = useFootprint
    ? "footprint"
    : useConvex
      ? "convex"
      : useExpand
        ? "expand"
        : "concave"

  return result
}
