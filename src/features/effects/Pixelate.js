import Victor from "victor"
import Effect from "./Effect"
import Graph, { getEulerianTrail } from "@/common/Graph"
import {
  centroid,
  findBounds,
  pointInPolygon,
  subsample,
} from "@/common/geometry"

const FILL_BBOX_COVERAGE_THRESHOLD = 0.7 // If fill covers >70% of bbox, it's likely a false positive
const FILL_STROKE_RATIO_THRESHOLD = 1.5 // Fill must be 1.5x larger than stroke to be chosen
const POINT_EPSILON = 0.0001 // Tolerance for comparing point coordinates
const VISUAL_SCALE_DIVISOR = 3 // Divisor to make pixel sizes visually appropriate

// Helper to create consistent cell keys for Set storage
const cellKey = (cx, cy) => `${cx},${cy}`

// Convert grid coordinates to world coordinates
const gridToWorld = (cx, cy, centroid, pixelSize) =>
  new Victor(centroid.x + cx * pixelSize, centroid.y + cy * pixelSize)

// Convert world coordinate to grid cell coordinate
const worldToGrid = (val, centroid, pixelSize) => {
  const relative = (val - centroid) / pixelSize
  // Round to 9 decimal places to avoid floating-point edge cases
  // (e.g., 2.9999999999 should floor to 3, not 2)
  const rounded = Math.round(relative * 1e9) / 1e9

  return Math.floor(rounded)
}

const options = {
  pixelatePixelSize: {
    title: "Pixel size",
    type: "slider",
    min: 1,
    max: 30,
    step: 1,
  },
}

export default class Pixelate extends Effect {
  constructor() {
    super("pixelate")
    this.label = "Pixelate"
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      pixelatePixelSize: 8,
    }
  }

  getVertices(effect, layer, vertices) {
    if (vertices.length < 2) {
      return vertices
    }

    // Scale pixel size with layer size so pixelation stays consistent when resizing
    // Use sqrt for gentler scaling - doubling layer size increases pixel size by ~1.4x
    const referenceSize = 100
    const layerSize = Math.max(
      layer.width || referenceSize,
      layer.height || referenceSize,
    )
    const scaleFactor = Math.sqrt(layerSize / referenceSize)
    const pixelSize =
      (effect.pixelatePixelSize * scaleFactor) / VISUAL_SCALE_DIVISOR
    const shapeCentroid = centroid(vertices)
    const bounds = findBounds(vertices)
    const subsampleLength = Math.max(1.0, pixelSize / 2)

    vertices = subsample(vertices, subsampleLength)

    const fillCells = this.findInsideCells(
      vertices,
      pixelSize,
      shapeCentroid,
      bounds,
    )
    const strokeCells = this.findStrokeCells(vertices, pixelSize, shapeCentroid)
    const cells = this.chooseCells(fillCells, strokeCells, bounds, pixelSize)

    if (cells.size === 0) {
      return vertices
    }

    return this.traceCellOutline(cells, pixelSize, shapeCentroid)
  }

  // Find all grid cells whose centers are inside the shape
  findInsideCells(vertices, pixelSize, shapeCentroid, bounds) {
    const cells = new Set()
    const [minX, minY] = [bounds[0].x, bounds[0].y]
    const [maxX, maxY] = [bounds[1].x, bounds[1].y]

    // Convert to grid cell range (centered on centroid)
    const cellMinX = Math.floor((minX - shapeCentroid.x) / pixelSize) - 1
    const cellMinY = Math.floor((minY - shapeCentroid.y) / pixelSize) - 1
    const cellMaxX = Math.ceil((maxX - shapeCentroid.x) / pixelSize) + 1
    const cellMaxY = Math.ceil((maxY - shapeCentroid.y) / pixelSize) + 1

    // Test each cell's center
    for (let cy = cellMinY; cy <= cellMaxY; cy++) {
      for (let cx = cellMinX; cx <= cellMaxX; cx++) {
        const cellCenter = gridToWorld(
          cx + 0.5,
          cy + 0.5,
          shapeCentroid,
          pixelSize,
        )

        if (pointInPolygon(cellCenter.x, cellCenter.y, vertices)) {
          cells.add(cellKey(cx, cy))
        }
      }
    }

    return cells
  }

  // Find all grid cells that the path passes through (stroke-based)
  findStrokeCells(vertices, pixelSize, centroid) {
    const cells = new Set()

    for (let i = 0; i < vertices.length - 1; i++) {
      const v0 = vertices[i]
      const v1 = vertices[i + 1]

      this.rasterizeSegment(v0.x, v0.y, v1.x, v1.y, pixelSize, cells, centroid)
    }

    return cells
  }

  // Rasterize a line segment using Bresenham's "supercover" variant.
  // Unlike standard Bresenham which visits only one cell per step, supercover
  // visits ALL cells the line passes through, including diagonal neighbors.
  rasterizeSegment(x0, y0, x1, y1, pixelSize, cells, shapeCentroid) {
    const gx0 = worldToGrid(x0, shapeCentroid.x, pixelSize)
    const gy0 = worldToGrid(y0, shapeCentroid.y, pixelSize)
    const gx1 = worldToGrid(x1, shapeCentroid.x, pixelSize)
    const gy1 = worldToGrid(y1, shapeCentroid.y, pixelSize)
    const dx = Math.abs(gx1 - gx0)
    const dy = Math.abs(gy1 - gy0)
    let x = gx0
    let y = gy0
    let n = 1 + dx + dy
    const xInc = gx1 > gx0 ? 1 : gx1 < gx0 ? -1 : 0
    const yInc = gy1 > gy0 ? 1 : gy1 < gy0 ? -1 : 0
    let error = dx - dy
    const dx2 = dx * 2
    const dy2 = dy * 2

    while (n > 0) {
      cells.add(cellKey(x, y))

      if (error > 0) {
        x += xInc
        error -= dy2
      } else if (error < 0) {
        y += yInc
        error += dx2
      } else {
        // Exactly on corner - add both adjacent cells for full coverage
        x += xInc
        error -= dy2
        cells.add(cellKey(x, y))
        y += yInc
        error += dx2
        n--
      }
      n--
    }
  }

  // Choose between fill and stroke cells based on shape characteristics
  chooseCells(fillCells, strokeCells, bounds, pixelSize) {
    // Compute bounding box area in cells to detect "fill everything" false positives
    const bboxCellsX = Math.ceil((bounds[1].x - bounds[0].x) / pixelSize) + 1
    const bboxCellsY = Math.ceil((bounds[1].y - bounds[0].y) / pixelSize) + 1
    const bboxArea = bboxCellsX * bboxCellsY

    // Use fill if it found substantially more cells than stroke (solid shape)
    // BUT not if fill covers almost the entire bounding box (line-based shapes
    // like maze/wiper where the path encloses everything but detail is in the path)
    const fillCoversAlmostAll =
      fillCells.size > bboxArea * FILL_BBOX_COVERAGE_THRESHOLD
    const fillIsSignificantlyLarger =
      fillCells.size > strokeCells.size * FILL_STROKE_RATIO_THRESHOLD

    if (fillIsSignificantlyLarger && !fillCoversAlmostAll) {
      return fillCells
    }

    return strokeCells
  }

  traceCellOutline(cells, pixelSize, shapeCentroid) {
    const graph = new Graph()

    // Each edge definition specifies:
    // - neighbor: offset to check if adjacent cell exists (if not, draw this edge)
    // - from/to: corner offsets within the cell for the edge endpoints
    const edgeDefs = [
      { neighbor: [0, -1], from: [0, 0], to: [1, 0] }, // Bottom edge
      { neighbor: [1, 0], from: [1, 0], to: [1, 1] }, // Right edge
      { neighbor: [0, 1], from: [1, 1], to: [0, 1] }, // Top edge
      { neighbor: [-1, 0], from: [0, 1], to: [0, 0] }, // Left edge
    ]

    for (const key of cells) {
      const [cx, cy] = key.split(",").map(Number)

      for (const { neighbor, from, to } of edgeDefs) {
        if (!cells.has(cellKey(cx + neighbor[0], cy + neighbor[1]))) {
          const n1 = gridToWorld(
            cx + from[0],
            cy + from[1],
            shapeCentroid,
            pixelSize,
          )
          const n2 = gridToWorld(
            cx + to[0],
            cy + to[1],
            shapeCentroid,
            pixelSize,
          )

          graph.addNode(n1)
          graph.addNode(n2)
          graph.addEdge(n1, n2)
        }
      }
    }

    if (graph.nodeKeys.size === 0) {
      return []
    }

    graph.connectComponents()

    const trail = getEulerianTrail(graph)
    const result = []

    // Convert trail to vertices
    for (const nodeKey of trail) {
      const node = graph.nodeMap[nodeKey]

      if (node) {
        // Skip duplicate consecutive points
        if (result.length > 0) {
          const last = result[result.length - 1]

          if (
            Math.abs(node.x - last.x) < POINT_EPSILON &&
            Math.abs(node.y - last.y) < POINT_EPSILON
          ) {
            continue
          }
        }
        result.push(new Victor(node.x, node.y))
      }
    }

    return result
  }

  getOptions() {
    return options
  }
}
