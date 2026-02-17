import Victor from "victor"
import { isoLines } from "marching-squares"
import Graph, { getEulerianTrail } from "@/common/Graph"
import {
  proximityNode,
  cloneVertex,
  cloneVertices,
  circle,
} from "@/common/geometry"
import { SUPERPOSITION, EXCITATION } from "./config"
import { METHOD } from "./methods"
import { defaultContours, getEffectiveValue } from "./helpers"

// Grid resolution scales with mode numbers for detail
const BASE_RESOLUTION = 200

// Convert grid index to domain coordinate
// "centered" uses [0, 1], "tiled" uses [-1, 1]
export function gridToDomain(i, resolution, domain) {
  const t = i / resolution

  return domain === "centered" ? t : t * 2 - 1
}

// Generate threshold values for contour levels
// Level 1: just nodal line (z=0)
// Level 2+: add amplitude contours
export function getThresholds(levels) {
  if (levels === 1) return [0]

  const thresholds = []
  const step = 1.5 / levels

  for (let i = -levels + 1; i < levels; i++) {
    thresholds.push(i * step)
  }

  return thresholds
}

// Draw contours using marching-squares library
export function drawContours(opts) {
  const { method, shape, modes, m, n, contourLevels, domain } = opts
  const computeField = METHOD[method][shape]

  // Resolution scales with complexity
  const complexity =
    method === "harmonic" ? modes : method === "excitation" ? 5 : Math.max(m, n)
  const resolution = BASE_RESOLUTION + complexity * 20
  const data = []

  // Circular always samples [-1,1] grid (circle centered at origin)
  // but applies domain transform in the formula
  // Rectangular uses domain to control grid sampling directly
  const effectiveDomain = shape === "circular" ? "tiled" : domain

  for (let j = 0; j <= resolution; j++) {
    const row = []
    const y = gridToDomain(j, resolution, effectiveDomain)

    for (let i = 0; i <= resolution; i++) {
      const x = gridToDomain(i, resolution, effectiveDomain)

      row.push(computeField(x, y, opts))
    }
    data.push(row)
  }

  const mode =
    method === "excitation"
      ? EXCITATION[opts.excitation]
      : SUPERPOSITION[opts.superposition]
  const effectiveLevels = getEffectiveValue(
    mode,
    "contours",
    shape,
    contourLevels,
    defaultContours,
  )
  const thresholds = getThresholds(effectiveLevels)
  const allContours = isoLines(data, thresholds)
  const paths = allContours.flatMap((contours) =>
    contours.map((path) =>
      path.map(([col, row]) => ({
        x: (col / resolution) * 2 - 1,
        y: (row / resolution) * 2 - 1,
      })),
    ),
  )

  return paths
}

// Draw border shape
export function drawBorder(type) {
  if (type === "circular") {
    return circle(1)
  }

  return [
    { x: -1, y: -1 },
    { x: 1, y: -1 },
    { x: 1, y: 1 },
    { x: -1, y: 1 },
    { x: -1, y: -1 },
  ]
}

// Build graph from paths for Eulerian trail
export function buildPathGraph(paths, tolerance = 0.01, precision = 4) {
  const graph = new Graph()
  const CLOSED_TOLERANCE = tolerance * 2

  for (const path of paths) {
    if (path.length < 2) continue

    for (const pt of path) {
      graph.addNode(proximityNode(pt.x, pt.y, tolerance, precision))
    }

    for (let i = 0; i < path.length - 1; i++) {
      const pt1 = path[i]
      const pt2 = path[i + 1]
      const node1 = proximityNode(pt1.x, pt1.y, tolerance, precision)
      const node2 = proximityNode(pt2.x, pt2.y, tolerance, precision)

      if (node1.toString() !== node2.toString()) {
        graph.addEdge(node1, node2)
      }
    }

    // For closed paths, add the closing edge
    const startPt = path[0]
    const endPt = path[path.length - 1]
    const dist = Math.hypot(endPt.x - startPt.x, endPt.y - startPt.y)

    if (dist < CLOSED_TOLERANCE) {
      const node1 = proximityNode(endPt.x, endPt.y, tolerance, precision)
      const node2 = proximityNode(startPt.x, startPt.y, tolerance, precision)

      if (node1.toString() !== node2.toString()) {
        graph.addEdge(node1, node2)
      }
    }
  }

  return graph
}

// Build continuous path from multiple contour paths
export function buildPath(paths) {
  if (paths.length === 0) {
    return [new Victor(0, 0)]
  }

  const victorPaths = paths.map((path) => cloneVertices(path))

  if (victorPaths.length === 1) {
    return victorPaths[0]
  }

  const tolerance = 0.01
  const graph = buildPathGraph(victorPaths, tolerance)

  graph.connectComponents()

  const trail = getEulerianTrail(graph)
  const vertices = []

  for (const nodeKey of trail) {
    const node = graph.nodeMap[nodeKey]

    if (node) {
      vertices.push(cloneVertex(node))
    }
  }

  return vertices.length > 0 ? vertices : [new Victor(0, 0)]
}
