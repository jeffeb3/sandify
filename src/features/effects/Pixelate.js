import Victor from "victor"
import Effect from "./Effect"
import Graph, { getEulerianTrail } from "@/common/Graph"
import { centroid, findBounds, pointInPolygon, subsample } from "@/common/geometry"

const FILL_BBOX_COVERAGE_THRESHOLD = 0.7  // If fill covers >70% of bbox, it's likely a false positive
const FILL_STROKE_RATIO_THRESHOLD = 1.5   // Fill must be 1.5x larger than stroke to be chosen
const POINT_EPSILON = 0.0001              // Tolerance for comparing point coordinates

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
    const layerSize = Math.max(layer.width || referenceSize, layer.height || referenceSize)
    const scaleFactor = Math.sqrt(layerSize / referenceSize)
    const pixelSize = effect.pixelatePixelSize * scaleFactor / 3
    const shapeCentroid = centroid(vertices)
    const subsampleLength = Math.max(1.0, pixelSize / 2)

    vertices = subsample(vertices, subsampleLength)

    const fillCells = this.findInsideCells(vertices, pixelSize, shapeCentroid)
    const strokeCells = this.findStrokeCells(vertices, pixelSize, shapeCentroid)
    const cells = this.chooseCells(fillCells, strokeCells, vertices, pixelSize)

    if (cells.size === 0) {
      return vertices
    }

    return this.traceCellOutline(cells, pixelSize, shapeCentroid)
  }

  // Find all grid cells whose centers are inside the shape
  findInsideCells(vertices, pixelSize, centroid) {
    const cells = new Set()
    const bounds = findBounds(vertices)
    const [minX, minY] = [bounds[0].x, bounds[0].y]
    const [maxX, maxY] = [bounds[1].x, bounds[1].y]

    // Convert to grid cell range (centered on centroid)
    const cellMinX = Math.floor((minX - centroid.x) / pixelSize) - 1
    const cellMinY = Math.floor((minY - centroid.y) / pixelSize) - 1
    const cellMaxX = Math.ceil((maxX - centroid.x) / pixelSize) + 1
    const cellMaxY = Math.ceil((maxY - centroid.y) / pixelSize) + 1

    // Test each cell's center
    for (let cy = cellMinY; cy <= cellMaxY; cy++) {
      for (let cx = cellMinX; cx <= cellMaxX; cx++) {
        // Cell center in world coordinates
        const centerX = centroid.x + (cx + 0.5) * pixelSize
        const centerY = centroid.y + (cy + 0.5) * pixelSize

        if (pointInPolygon(centerX, centerY, vertices)) {
          cells.add(`${cx},${cy}`)
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

  // Choose between fill and stroke cells based on shape characteristics
  chooseCells(fillCells, strokeCells, vertices, pixelSize) {
    // Compute bounding box area in cells to detect "fill everything" false positives
    const bounds = findBounds(vertices)
    const bboxCellsX = Math.ceil((bounds[1].x - bounds[0].x) / pixelSize) + 1
    const bboxCellsY = Math.ceil((bounds[1].y - bounds[0].y) / pixelSize) + 1
    const bboxArea = bboxCellsX * bboxCellsY

    // Use fill if it found substantially more cells than stroke (solid shape)
    // BUT not if fill covers almost the entire bounding box (line-based shapes
    // like maze/wiper where the path encloses everything but detail is in the path)
    const fillCoversAlmostAll = fillCells.size > bboxArea * FILL_BBOX_COVERAGE_THRESHOLD
    const fillIsSignificantlyLarger = fillCells.size > strokeCells.size * FILL_STROKE_RATIO_THRESHOLD

    if (fillIsSignificantlyLarger && !fillCoversAlmostAll) {
      return fillCells
    }

    return strokeCells
  }

  // Convert world coordinate to grid cell coordinate
  toGridCoord(val, centroid, pixelSize) {
    const relative = (val - centroid) / pixelSize
    const rounded = Math.round(relative * 1e9) / 1e9

    return Math.floor(rounded)
  }

  // Rasterize a single line segment using supercover algorithm
  rasterizeSegment(x0, y0, x1, y1, pixelSize, cells, centroid) {
    const gx0 = this.toGridCoord(x0, centroid.x, pixelSize)
    const gy0 = this.toGridCoord(y0, centroid.y, pixelSize)
    const gx1 = this.toGridCoord(x1, centroid.x, pixelSize)
    const gy1 = this.toGridCoord(y1, centroid.y, pixelSize)
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
      cells.add(`${x},${y}`)

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
        cells.add(`${x},${y}`)
        y += yInc
        error += dx2
        n--
      }
      n--
    }
  }

  traceCellOutline(cells, pixelSize, centroid) {
    const graph = new Graph()

    // Edge definitions: [neighborOffsetX, neighborOffsetY, corner1X, corner1Y, corner2X, corner2Y]
    const edgeDefs = [
      [0, -1, 0, 0, 1, 0],  // Bottom edge (if no cell below)
      [1, 0, 1, 0, 1, 1],   // Right edge (if no cell to the right)
      [0, 1, 1, 1, 0, 1],   // Top edge (if no cell above)
      [-1, 0, 0, 1, 0, 0],  // Left edge (if no cell to the left)
    ]

    for (const cellKey of cells) {
      const [cx, cy] = cellKey.split(",").map(Number)

      for (const [nx, ny, c1x, c1y, c2x, c2y] of edgeDefs) {
        if (!cells.has(`${cx + nx},${cy + ny}`)) {
          const n1 = new Victor(centroid.x + (cx + c1x) * pixelSize, centroid.y + (cy + c1y) * pixelSize)
          const n2 = new Victor(centroid.x + (cx + c2x) * pixelSize, centroid.y + (cy + c2y) * pixelSize)

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

          if (Math.abs(node.x - last.x) < POINT_EPSILON && Math.abs(node.y - last.y) < POINT_EPSILON) {
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
