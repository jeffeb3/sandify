import TraceSkeleton from "skeleton-tracing-js/trace_skeleton.vanilla.js"
import Victor from "victor"
import Graph, { getEulerianTrail } from "@/common/Graph"
import { pixelProcessor } from "./helpers"

const linetrace = (config, data) => {
  const w = config.width
  const h = config.height
  const getPixel = pixelProcessor(config, data)
  const threshold = config.Threshold
  const minSegLen = config.MinSegmentLength
  const simplifyTol = config.SimplifyTolerance
  const dilateRadius = config.DilateRadius
  const residualRecovery = config.ResidualRecovery

  // Phase 1: build grayscale from pixelProcessor (handles brightness/contrast/inversion)
  const grayscale = new Float32Array(w * h)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      grayscale[y * w + x] = getPixel(x, y)
    }
  }

  // 3x3 box blur to smooth JPEG artifacts before thresholding
  const blurred = boxBlur3x3(grayscale, w, h)

  // Threshold to binary
  const boolArr = new Uint8Array(w * h)
  for (let i = 0; i < w * h; i++) {
    boolArr[i] = blurred[i] >= threshold ? 1 : 0
  }

  // Phase 1b: morphological dilation
  let inputArr = boolArr
  if (dilateRadius > 0) {
    inputArr = dilateBinary(boolArr, w, h, dilateRadius)
  }

  // Phase 2: skeleton tracing
  // Use Array (not Uint8Array) since skeleton-tracing-js expects plain array
  const skeletonInput = new Array(w * h)
  for (let i = 0; i < w * h; i++) skeletonInput[i] = inputArr[i]

  const result = TraceSkeleton.fromBoolArray(skeletonInput, w, h)
  let polylines = result.polylines

  // Phase 3: residual recovery — find ink pixels missed by the skeleton tracer
  // and trace them into additional polylines
  if (residualRecovery) {
    const residualPolylines = recoverResidualInk(boolArr, polylines, w, h)
    polylines = polylines.concat(residualPolylines)
  }

  // Phase 4: filter short polylines
  if (minSegLen > 0) {
    polylines = polylines.filter((pl) => polylineLength(pl) >= minSegLen)
  }

  if (polylines.length === 0) {
    return []
  }

  // Phase 5: simplify polylines (Douglas-Peucker)
  if (simplifyTol > 0) {
    polylines = polylines.map((pl) => douglasPeucker(pl, simplifyTol))
  }

  // Phase 6: connect into single continuous path
  let connected
  const totalPoints = polylines.reduce((sum, pl) => sum + pl.length, 0)

  if (totalPoints <= 30000) {
    connected = connectPolylinesGraph(polylines)
  } else {
    connected = connectPolylinesGreedy(polylines)
  }

  // Phase 7: convert to Victor array with Y-flip
  return connected.map(([x, y]) => new Victor(x, h - y))
}

// ---- Residual ink recovery ----
// After skeleton tracing, some ink pixels may not be near any polyline
// (skeleton-tracing-js misses them due to its divide-and-conquer approach).
// This finds those pixels and traces them into additional polylines.

const COVERAGE_RADIUS = 2

function recoverResidualInk(boolArr, polylines, w, h) {
  // Build a coverage mask: mark all pixels within COVERAGE_RADIUS of any polyline point
  const covered = new Uint8Array(w * h)
  const r = COVERAGE_RADIUS

  for (const pl of polylines) {
    for (const [px, py] of pl) {
      const ix = Math.round(px)
      const iy = Math.round(py)
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          const nx = ix + dx
          const ny = iy + dy
          if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
            covered[ny * w + nx] = 1
          }
        }
      }
    }
  }

  // Find uncovered ink pixels
  const uncovered = new Uint8Array(w * h)
  for (let i = 0; i < w * h; i++) {
    uncovered[i] = boolArr[i] === 1 && covered[i] === 0 ? 1 : 0
  }

  // Trace uncovered pixels into connected components, then build polylines
  const visited = new Uint8Array(w * h)
  const result = []

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (uncovered[y * w + x] !== 1 || visited[y * w + x]) continue

      // BFS to collect connected component
      const component = []
      const queue = [[x, y]]
      visited[y * w + x] = 1

      while (queue.length > 0) {
        const [cx, cy] = queue.shift()
        component.push([cx, cy])

        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue
            const nx = cx + dx
            const ny = cy + dy
            if (
              nx >= 0 &&
              nx < w &&
              ny >= 0 &&
              ny < h &&
              uncovered[ny * w + nx] === 1 &&
              !visited[ny * w + nx]
            ) {
              visited[ny * w + nx] = 1
              queue.push([nx, ny])
            }
          }
        }
      }

      // Convert component to a polyline by walking along the pixels
      if (component.length >= 2) {
        const polyline = orderComponent(component)
        result.push(polyline)
      }
    }
  }

  return result
}

// Order a connected component's pixels into a polyline by greedy nearest-neighbor walk
function orderComponent(pixels) {
  if (pixels.length <= 2) return pixels

  const remaining = new Set(pixels.map((p, i) => i))
  const result = [pixels[0]]
  remaining.delete(0)

  while (remaining.size > 0) {
    const [cx, cy] = result[result.length - 1]
    let bestIdx = -1
    let bestDist = Infinity

    for (const idx of remaining) {
      const [px, py] = pixels[idx]
      const d = (px - cx) * (px - cx) + (py - cy) * (py - cy)
      if (d < bestDist) {
        bestDist = d
        bestIdx = idx
      }
      // Early exit for adjacent pixels
      if (d <= 2) break
    }

    remaining.delete(bestIdx)
    result.push(pixels[bestIdx])
  }

  return result
}

// ---- Morphological dilation ----

function dilateBinary(src, w, h, radius) {
  const dst = new Uint8Array(w * h)
  const r = Math.round(radius)

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (src[y * w + x] !== 1) continue
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          const nx = x + dx
          const ny = y + dy
          if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
            dst[ny * w + nx] = 1
          }
        }
      }
    }
  }

  return dst
}

// ---- Graph-based path connection ----

const SNAP_RADIUS = 1

function pointKey(x, y) {
  return `${Math.round(x)},${Math.round(y)}`
}

function connectPolylinesGraph(polylines) {
  const nodeMap = new Map()

  function getOrCreateNode(x, y) {
    const key = pointKey(x, y)
    if (nodeMap.has(key)) return nodeMap.get(key)

    for (const [, node] of nodeMap) {
      const dx = node.x - x
      const dy = node.y - y
      if (dx * dx + dy * dy <= SNAP_RADIUS * SNAP_RADIUS) {
        return node
      }
    }

    const node = { x, y, victor: new Victor(x, y), key }
    nodeMap.set(key, node)
    return node
  }

  const graph = new Graph()

  for (const pl of polylines) {
    if (pl.length < 2) continue

    const nodes = []
    for (let i = 0; i < pl.length; i++) {
      const node = getOrCreateNode(pl[i][0], pl[i][1])
      if (!graph.nodeKeys.has(node.victor.toString())) {
        graph.addNode(node.victor)
      }
      nodes.push(node)
    }

    for (let i = 0; i < nodes.length - 1; i++) {
      const n1 = nodes[i]
      const n2 = nodes[i + 1]
      if (n1 === n2) continue

      const ek = [n1.victor.toString(), n2.victor.toString()].sort().toString()
      if (!graph.edgeKeys.has(ek)) {
        const dist = Math.hypot(n2.x - n1.x, n2.y - n1.y)
        graph.addEdge(n1.victor, n2.victor, dist)
      }
    }
  }

  if (graph.nodeKeys.size === 0 || graph.edgeKeys.size === 0) {
    return connectPolylinesGreedy(polylines)
  }

  graph.connectComponents()

  let trail
  try {
    trail = getEulerianTrail(graph)
  } catch {
    return connectPolylinesGreedy(polylines)
  }

  if (!trail || trail.length < 2) {
    return connectPolylinesGreedy(polylines)
  }

  const result = []
  for (const nodeKey of trail) {
    const node = graph.getNode(nodeKey)
    if (node) {
      result.push([node.x, node.y])
    }
  }

  return result
}

// ---- Greedy nearest-neighbor fallback ----

function connectPolylinesGreedy(polylines) {
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
    const seg = bestReverse
      ? [...polylines[bestIdx]].reverse()
      : polylines[bestIdx]
    for (const pt of seg) {
      result.push(pt)
    }
  }

  return result
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

function perpendicularDist(pt, a, b) {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const lenSq = dx * dx + dy * dy
  if (lenSq === 0) {
    const ex = pt[0] - a[0]
    const ey = pt[1] - a[1]
    return Math.sqrt(ex * ex + ey * ey)
  }
  return (
    Math.abs((pt[0] - a[0]) * dy - (pt[1] - a[1]) * dx) / Math.sqrt(lenSq)
  )
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
