import Grid from "./Grid"

// Triangular grid for delta mazes
// Uses alternating up/down triangles based on coordinate parity

export default class TriangleGrid extends Grid {
  constructor(width, height, rng) {
    super()
    this.width = width
    this.height = height
    this.rng = rng

    this.triHeight = Math.sqrt(3) / 2

    // Keep triangles regular (equilateral) - no distortion
    // Maze.js getMazeAspectRatio() handles the actual grid aspect ratio
    this.yScale = 1
    this.cells = []

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        this.cells.push(this.createCell(x, y))
      }
    }
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

  cellEquals(cell1, cell2) {
    return cell1.x === cell2.x && cell1.y === cell2.y
  }

  // Get the center point of a cell (geometric center, not centroid)
  // Using y + 0.5 ensures line-of-sight to all edges
  getCellCenter(cell) {
    const { x, y } = cell
    const h = this.triHeight
    const ys = this.yScale
    const baseX = x * 0.5

    return {
      x: baseX + 0.5,
      y: (y + 0.5) * h * ys,
    }
  }

  // Get midpoint of shared edge between two adjacent cells
  getSharedEdgeMidpoint(cell1, cell2) {
    const c1 = this.getTriangleCorners(cell1.x, cell1.y)
    const dx = cell2.x - cell1.x
    const dy = cell2.y - cell1.y

    let p1, p2

    if (dx === 1) {
      // cell2 is east
      if (cell1.upward) {
        p1 = c1.top
        p2 = c1.bottomRight
      } else {
        p1 = c1.topRight
        p2 = c1.bottom
      }
    } else if (dx === -1) {
      // cell2 is west
      if (cell1.upward) {
        p1 = c1.top
        p2 = c1.bottomLeft
      } else {
        p1 = c1.topLeft
        p2 = c1.bottom
      }
    } else if (dy === 1) {
      // cell2 is south (cell1 must be upward)
      p1 = c1.bottomLeft
      p2 = c1.bottomRight
    } else {
      // cell2 is north (cell1 must be downward)
      p1 = c1.topLeft
      p2 = c1.topRight
    }

    return {
      x: (p1[0] + p2[0]) / 2,
      y: (p1[1] + p2[1]) / 2,
    }
  }

  // Get cells on the grid perimeter with their exit directions
  // For triangles: top/bottom rows and left/right edges
  getEdgeCells() {
    const edgeCells = []

    for (const cell of this.cells) {
      const { y, upward } = cell

      // Top row: DOWN triangles have horizontal top edge
      if (y === 0 && !upward) {
        edgeCells.push({ cell, direction: "n", edge: "n" })
      }

      // Bottom row: UP triangles have horizontal bottom edge
      if (y === this.height - 1 && upward) {
        edgeCells.push({ cell, direction: "s", edge: "s" })
      }
    }

    return edgeCells
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
    const makeVertex = this.createMakeVertex(vertexCache)

    const arrowScale = 0.6

    const addExit = (cell, x1, y1, x2, y2, direction) => {
      // For horizontal edges: n = inward down, s = inward up
      const inwardDx = 0
      const inwardDy = direction === "n" ? 1 : -1

      this.addExitWithArrow(
        walls,
        makeVertex,
        cell,
        x1,
        y1,
        x2,
        y2,
        inwardDx,
        inwardDy,
        arrowScale,
      )
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
          if (cell.exitDirection === "s") {
            addExit(
              cell,
              corners.bottomLeft[0],
              corners.bottomLeft[1],
              corners.bottomRight[0],
              corners.bottomRight[1],
              "s",
            )
          } else {
            walls.push([
              makeVertex(corners.bottomLeft[0], corners.bottomLeft[1]),
              makeVertex(corners.bottomRight[0], corners.bottomRight[1]),
            ])
          }
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
          if (cell.exitDirection === "n") {
            addExit(
              cell,
              corners.topLeft[0],
              corners.topLeft[1],
              corners.topRight[0],
              corners.topRight[1],
              "n",
            )
          } else {
            walls.push([
              makeVertex(corners.topLeft[0], corners.topLeft[1]),
              makeVertex(corners.topRight[0], corners.topRight[1]),
            ])
          }
        }
      }
    }

    return walls
  }
}
