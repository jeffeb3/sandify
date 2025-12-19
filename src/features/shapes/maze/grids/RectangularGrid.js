import Victor from "victor"

// Rectangular grid for standard mazes
// Implements the same interface as PolarGrid for algorithm compatibility

export default class RectangularGrid {
  constructor(width, height, rng) {
    this.gridType = "rectangular"
    this.width = width
    this.height = height
    this.rng = rng

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
      links: new Set(),
      visited: false,
    }
  }

  // Get cell at position
  getCell(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return null

    return this.cells[y * this.width + x]
  }

  // Get all cells as flat array
  getAllCells() {
    return this.cells
  }

  // Get a random cell
  getRandomCell() {
    return this.cells[Math.floor(this.rng() * this.cells.length)]
  }

  // Get neighbors of a cell (N, S, E, W)
  getNeighbors(cell) {
    const { x, y } = cell
    const neighbors = []

    // North
    if (y > 0) neighbors.push(this.getCell(x, y - 1))
    // South
    if (y < this.height - 1) neighbors.push(this.getCell(x, y + 1))
    // East
    if (x < this.width - 1) neighbors.push(this.getCell(x + 1, y))
    // West
    if (x > 0) neighbors.push(this.getCell(x - 1, y))

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

  extractWalls() {
    const walls = []

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const cell = this.getCell(x, y)

        // North wall (top of cell)
        if (y === 0) {
          // Boundary - always a wall
          walls.push([new Victor(x, y), new Victor(x + 1, y)])
        } else {
          const northNeighbor = this.getCell(x, y - 1)

          if (!this.isLinked(cell, northNeighbor)) {
            walls.push([new Victor(x, y), new Victor(x + 1, y)])
          }
        }

        // West wall (left of cell)
        if (x === 0) {
          // Boundary - always a wall
          walls.push([new Victor(x, y), new Victor(x, y + 1)])
        } else {
          const westNeighbor = this.getCell(x - 1, y)

          if (!this.isLinked(cell, westNeighbor)) {
            walls.push([new Victor(x, y), new Victor(x, y + 1)])
          }
        }

        // South wall (bottom edge only for last row)
        if (y === this.height - 1) {
          walls.push([new Victor(x, y + 1), new Victor(x + 1, y + 1)])
        }

        // East wall (right edge only for last column)
        if (x === this.width - 1) {
          walls.push([new Victor(x + 1, y), new Victor(x + 1, y + 1)])
        }
      }
    }

    return walls
  }

  // Debug: dump maze as ASCII art (y=0 at bottom)
  dump() {
    let output = ""

    for (let y = this.height - 1; y >= 0; y--) {
      let topLine = ""

      for (let x = 0; x < this.width; x++) {
        const cell = this.getCell(x, y)
        const southCell = this.getCell(x, y + 1)
        const hasSouthLink = southCell && this.isLinked(cell, southCell)

        topLine += "+" + (hasSouthLink ? "   " : "---")
      }
      topLine += "+"
      output += topLine + "\n"

      let cellLine = ""

      for (let x = 0; x < this.width; x++) {
        const cell = this.getCell(x, y)
        const westCell = this.getCell(x - 1, y)
        const hasWestLink = westCell && this.isLinked(cell, westCell)

        cellLine += (hasWestLink ? " " : "|") + "   "
      }
      cellLine += "|"
      output += cellLine + "\n"
    }

    let bottomLine = ""

    for (let x = 0; x < this.width; x++) {
      bottomLine += "+---"
    }
    bottomLine += "+"
    output += bottomLine + "\n"

    console.log(output)

    return output
  }
}
