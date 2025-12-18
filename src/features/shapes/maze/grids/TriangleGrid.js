import Victor from "victor"

// Triangular grid for delta mazes
// Uses alternating up/down triangles based on coordinate parity

export default class TriangleGrid {
  constructor(width, height, rng) {
    this.gridType = "triangle"
    this.width = width
    this.height = height
    this.rng = rng

    this.triHeight = Math.sqrt(3) / 2

    // Calculate raw dimensions for aspect ratio
    // Screen width: triangles overlap, so width = (W-1)*0.5 + 1 = 0.5*W + 0.5
    // Screen height: H * triHeight
    const rawWidth = 0.5 * width + 0.5
    const rawHeight = height * this.triHeight

    this.yScale = rawWidth / rawHeight
    this.cells = []

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        this.cells.push(this.createCell(x, y))
      }
    }

    const startIndex = Math.floor(rng() * this.cells.length)

    this.cells[startIndex].visited = true
  }

  createCell(x, y) {
    return {
      x,
      y,
      upward: this.isUpward(x, y),
      links: new Set(),
      visited: false,
    }
  }

  // Parity check determines triangle orientation
  // Even sum = DOWN (base on north), Odd sum = UP (base on south)
  isUpward(x, y) {
    return (x + y) % 2 === 1
  }

  getCell(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return null

    return this.cells[y * this.width + x]
  }

  getAllCells() {
    return this.cells
  }

  getRandomCell() {
    return this.cells[Math.floor(this.rng() * this.cells.length)]
  }

  // 3 neighbors per cell: E, W, and either N (down) or S (up)
  getNeighbors(cell) {
    const { x, y, upward } = cell
    const neighbors = []

    // East neighbor (always)
    const east = this.getCell(x + 1, y)
    if (east) neighbors.push(east)

    // West neighbor (always)
    const west = this.getCell(x - 1, y)
    if (west) neighbors.push(west)

    // Vertical neighbor depends on orientation
    if (upward) {
      // UP triangle has base on south, connects to south neighbor
      const south = this.getCell(x, y + 1)
      if (south) neighbors.push(south)
    } else {
      // DOWN triangle has base on north, connects to north neighbor
      const north = this.getCell(x, y - 1)
      if (north) neighbors.push(north)
    }

    return neighbors
  }

  cellKey(cell) {
    return `${cell.x},${cell.y}`
  }

  link(cell1, cell2) {
    cell1.links.add(this.cellKey(cell2))
    cell2.links.add(this.cellKey(cell1))
  }

  unlink(cell1, cell2) {
    cell1.links.delete(this.cellKey(cell2))
    cell2.links.delete(this.cellKey(cell1))
  }

  isLinked(cell1, cell2) {
    return cell1.links.has(this.cellKey(cell2))
  }

  markVisited(cell) {
    cell.visited = true
  }

  isVisited(cell) {
    return cell.visited
  }

  cellEquals(cell1, cell2) {
    return cell1.x === cell2.x && cell1.y === cell2.y
  }

  getTriangleCorners(x, y) {
    const h = this.triHeight
    const ys = this.yScale
    const baseX = x * 0.5

    if (this.isUpward(x, y)) {
      // UP triangle: apex at top, base at bottom
      return {
        top: [baseX + 0.5, y * h * ys],
        bottomLeft: [baseX, (y + 1) * h * ys],
        bottomRight: [baseX + 1, (y + 1) * h * ys],
      }
    } else {
      // DOWN triangle: base at top, apex at bottom
      return {
        topLeft: [baseX, y * h * ys],
        topRight: [baseX + 1, y * h * ys],
        bottom: [baseX + 0.5, (y + 1) * h * ys],
      }
    }
  }

  extractWalls() {
    const walls = []
    const vertexCache = new Map()

    const makeVertex = (x, y) => {
      const rx = Math.round(x * 1000000) / 1000000
      const ry = Math.round(y * 1000000) / 1000000
      const key = `${rx},${ry}`

      if (!vertexCache.has(key)) {
        vertexCache.set(key, new Victor(rx, ry))
      }

      return vertexCache.get(key)
    }

    for (const cell of this.cells) {
      const { x, y, upward } = cell
      const corners = this.getTriangleCorners(x, y)

      // East neighbor
      const east = this.getCell(x + 1, y)

      // West neighbor
      const west = this.getCell(x - 1, y)

      if (upward) {
        // UP triangle: top, bottomLeft, bottomRight
        // Left edge: top to bottomLeft (shared with west)
        if (!west || !this.isLinked(cell, west)) {
          walls.push([
            makeVertex(corners.top[0], corners.top[1]),
            makeVertex(corners.bottomLeft[0], corners.bottomLeft[1]),
          ])
        }

        // Right edge: top to bottomRight (shared with east)
        if (!east || !this.isLinked(cell, east)) {
          walls.push([
            makeVertex(corners.top[0], corners.top[1]),
            makeVertex(corners.bottomRight[0], corners.bottomRight[1]),
          ])
        }

        // Bottom edge: bottomLeft to bottomRight (shared with south)
        const south = this.getCell(x, y + 1)
        if (!south || !this.isLinked(cell, south)) {
          walls.push([
            makeVertex(corners.bottomLeft[0], corners.bottomLeft[1]),
            makeVertex(corners.bottomRight[0], corners.bottomRight[1]),
          ])
        }
      } else {
        // DOWN triangle: topLeft, topRight, bottom
        // Left edge: topLeft to bottom (shared with west)
        if (!west || !this.isLinked(cell, west)) {
          walls.push([
            makeVertex(corners.topLeft[0], corners.topLeft[1]),
            makeVertex(corners.bottom[0], corners.bottom[1]),
          ])
        }

        // Right edge: topRight to bottom (shared with east)
        if (!east || !this.isLinked(cell, east)) {
          walls.push([
            makeVertex(corners.topRight[0], corners.topRight[1]),
            makeVertex(corners.bottom[0], corners.bottom[1]),
          ])
        }

        // Top edge: topLeft to topRight (shared with north)
        const north = this.getCell(x, y - 1)
        if (!north || !this.isLinked(cell, north)) {
          walls.push([
            makeVertex(corners.topLeft[0], corners.topLeft[1]),
            makeVertex(corners.topRight[0], corners.topRight[1]),
          ])
        }
      }
    }

    return walls
  }
}
