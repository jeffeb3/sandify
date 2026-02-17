import TraceSkeleton from "skeleton-tracing-js/trace_skeleton.vanilla.js"
import Victor from "victor"
import { pixelProcessor } from "./helpers"

const linetrace = (config, data) => {
  const w = config.width
  const h = config.height
  const getPixel = pixelProcessor(config, data)
  const threshold = config.Threshold
  const minSegLen = config.MinSegmentLength
  const simplifyTol = config.SimplifyTolerance

  // Phase 1: build grayscale from pixelProcessor (handles brightness/contrast/inversion)
  const grayscale = new Float32Array(w * h)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      grayscale[y * w + x] = getPixel(x, y)
    }
  }

  // 3x3 box blur to smooth JPEG artifacts before thresholding
  const blurred = boxBlur3x3(grayscale, w, h)

  // Threshold to binary. pixelProcessor returns higher values for darker pixels
  // (ink), so >= threshold captures ink.
  const boolArr = new Array(w * h)
  for (let i = 0; i < w * h; i++) {
    boolArr[i] = blurred[i] >= threshold ? 1 : 0
  }

  // Phase 2: skeleton tracing
  const result = TraceSkeleton.fromBoolArray(boolArr, w, h)
  let polylines = result.polylines

  // Phase 3: filter short polylines
  if (minSegLen > 0) {
    polylines = polylines.filter((pl) => polylineLength(pl) >= minSegLen)
  }

  if (polylines.length === 0) {
    return []
  }

  // Phase 4: simplify polylines (Douglas-Peucker)
  if (simplifyTol > 0) {
    polylines = polylines.map((pl) => douglasPeucker(pl, simplifyTol))
  }

  // Phase 5: connect into single continuous path (nearest-neighbor)
  const connected = connectPolylines(polylines)

  // Phase 6: convert to Victor array with Y-flip
  return connected.map(([x, y]) => new Victor(x, h - y))
}

// ---- Utilities ----

function boxBlur3x3(src, w, h) {
  const dst = new Float32Array(w * h)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0
      let count = 0
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx
          const ny = y + dy
          if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
            sum += src[ny * w + nx]
            count++
          }
        }
      }
      dst[y * w + x] = sum / count
    }
  }
  return dst
}

function polylineLength(pl) {
  let len = 0
  for (let i = 1; i < pl.length; i++) {
    const dx = pl[i][0] - pl[i - 1][0]
    const dy = pl[i][1] - pl[i - 1][1]
    len += Math.sqrt(dx * dx + dy * dy)
  }
  return len
}

function distSq(a, b) {
  const dx = a[0] - b[0]
  const dy = a[1] - b[1]
  return dx * dx + dy * dy
}

function connectPolylines(polylines) {
  if (polylines.length === 0) return []
  if (polylines.length === 1) return [...polylines[0]]

  const used = new Array(polylines.length).fill(false)
  const result = [...polylines[0]]
  used[0] = true

  for (let count = 1; count < polylines.length; count++) {
    const end = result[result.length - 1]
    let bestIdx = -1
    let bestDist = Infinity
    let bestReverse = false

    for (let i = 0; i < polylines.length; i++) {
      if (used[i]) continue
      const pl = polylines[i]
      const dStart = distSq(end, pl[0])
      const dEnd = distSq(end, pl[pl.length - 1])

      if (dStart < bestDist) {
        bestDist = dStart
        bestIdx = i
        bestReverse = false
      }
      if (dEnd < bestDist) {
        bestDist = dEnd
        bestIdx = i
        bestReverse = true
      }
    }

    used[bestIdx] = true
    const seg = bestReverse ? [...polylines[bestIdx]].reverse() : polylines[bestIdx]
    for (const pt of seg) {
      result.push(pt)
    }
  }

  return result
}

function perpendicularDist(pt, a, b) {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const lenSq = dx * dx + dy * dy
  if (lenSq === 0) {
    const ex = pt[0] - a[0]
    const ey = pt[1] - a[1]
    return Math.sqrt(ex * ex + ey * ey)
  }
  return Math.abs((pt[0] - a[0]) * dy - (pt[1] - a[1]) * dx) / Math.sqrt(lenSq)
}

function douglasPeucker(points, tolerance) {
  if (points.length <= 2) return points

  const first = points[0]
  const last = points[points.length - 1]
  let maxDist = 0
  let maxIdx = 0

  for (let i = 1; i < points.length - 1; i++) {
    const d = perpendicularDist(points[i], first, last)
    if (d > maxDist) {
      maxDist = d
      maxIdx = i
    }
  }

  if (maxDist > tolerance) {
    const left = douglasPeucker(points.slice(0, maxIdx + 1), tolerance)
    const right = douglasPeucker(points.slice(maxIdx), tolerance)
    return left.slice(0, -1).concat(right)
  }
  return [first, last]
}

export default linetrace
