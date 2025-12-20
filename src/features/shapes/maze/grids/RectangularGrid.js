/* global console */
import Victor from "victor"
import Grid from "./Grid"

// Rectangular grid for standard mazes
// Implements the same interface as PolarGrid for algorithm compatibility

export default class RectangularGrid extends Grid {
  constructor(width, height, rng) {
    super()
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

  cellEquals(cell1, cell2) {
    return cell1.x === cell2.x && cell1.y === cell2.y
  }

  // Get the center point of a cell (for solution path drawing)
  getCellCenter(cell) {
    return {
      x: cell.x + 0.5,
      y: cell.y + 0.5,
    }
  }

  // Get midpoint of shared edge between two adjacent cells
  getSharedEdgeMidpoint(cell1, cell2) {
    const dx = cell2.x - cell1.x
    const dy = cell2.y - cell1.y

    if (dy === -1) {
      // cell2 is north
      return { x: cell1.x + 0.5, y: cell1.y }
    } else if (dy === 1) {
      // cell2 is south
      return { x: cell1.x + 0.5, y: cell1.y + 1 }
    } else if (dx === 1) {
      // cell2 is east
      return { x: cell1.x + 1, y: cell1.y + 0.5 }
    } else {
      // cell2 is west
      return { x: cell1.x, y: cell1.y + 0.5 }
    }
  }

  // Get all cells on the grid perimeter with their exit directions
  // edge property allows filtering to ensure exits are on opposite edges
  getEdgeCells() {
    const edgeCells = []

    for (const cell of this.cells) {
      const { x, y } = cell

      // Prefer corners: pick one direction (priority: N, S, E, W)
      if (y === 0) {
        edgeCells.push({ cell, direction: "n", edge: "n" })
      } else if (y === this.height - 1) {
        edgeCells.push({ cell, direction: "s", edge: "s" })
      } else if (x === 0) {
        edgeCells.push({ cell, direction: "w", edge: "w" })
      } else if (x === this.width - 1) {
        edgeCells.push({ cell, direction: "e", edge: "e" })
      }
    }

    return edgeCells
  }

  extractWalls() {
    const walls = []
    const vertexCache = new Map()
    const makeVertex = this.createMakeVertex(vertexCache, false)

    // Inward directions for each edge (into the maze)
    const inwardDir = {
      n: { dx: 0, dy: 1 },
      s: { dx: 0, dy: -1 },
      w: { dx: 1, dy: 0 },
      e: { dx: -1, dy: 0 },
    }

    const addExit = (cell, x1, y1, x2, y2, direction) => {
      const { dx, dy } = inwardDir[direction]

      this.addExitWithArrow(walls, makeVertex, cell, x1, y1, x2, y2, dx, dy)
    }

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const cell = this.getCell(x, y)

        // North wall (top of cell)
        if (y === 0) {
          if (cell.exitDirection === "n") {
            addExit(cell, x, y, x + 1, y, "n")
          } else {
            walls.push([makeVertex(x, y), makeVertex(x + 1, y)])
          }
        } else {
          const northNeighbor = this.getCell(x, y - 1)

          if (!this.isLinked(cell, northNeighbor)) {
            walls.push([makeVertex(x, y), makeVertex(x + 1, y)])
          }
        }

        // West wall (left of cell)
        if (x === 0) {
          if (cell.exitDirection === "w") {
            addExit(cell, x, y, x, y + 1, "w")
          } else {
            walls.push([makeVertex(x, y), makeVertex(x, y + 1)])
          }
        } else {
          const westNeighbor = this.getCell(x - 1, y)

          if (!this.isLinked(cell, westNeighbor)) {
            walls.push([makeVertex(x, y), makeVertex(x, y + 1)])
          }
        }

        // South wall (bottom edge only for last row)
        if (y === this.height - 1) {
          if (cell.exitDirection === "s") {
            addExit(cell, x, y + 1, x + 1, y + 1, "s")
          } else {
            walls.push([makeVertex(x, y + 1), makeVertex(x + 1, y + 1)])
          }
        }

        // East wall (right edge only for last column)
        if (x === this.width - 1) {
          if (cell.exitDirection === "e") {
            addExit(cell, x + 1, y, x + 1, y + 1, "e")
          } else {
            walls.push([makeVertex(x + 1, y), makeVertex(x + 1, y + 1)])
          }
        }
      }
    }

    return walls
  }

  // Debug: dump maze as ASCII art (y=0 at bottom, with cell coords)
  dump() {
    let output = ""

    for (let y = this.height - 1; y >= 0; y--) {
      let topLine = ""

      for (let x = 0; x < this.width; x++) {
        const cell = this.getCell(x, y)
        const southCell = this.getCell(x, y + 1)
        const hasSouthLink = southCell && this.isLinked(cell, southCell)

        topLine += "+" + (hasSouthLink ? "     " : "-----")
      }
      topLine += "+"
      output += topLine + "\n"

      let cellLine = ""

      for (let x = 0; x < this.width; x++) {
        const cell = this.getCell(x, y)
        const westCell = this.getCell(x - 1, y)
        const hasWestLink = westCell && this.isLinked(cell, westCell)
        const coord = `${x},${y}`.padStart(3).padEnd(5)

        cellLine += (hasWestLink ? " " : "|") + coord
      }
      cellLine += "|"
      output += cellLine + "\n"
    }

    let bottomLine = ""

    for (let x = 0; x < this.width; x++) {
      bottomLine += "+-----"
    }
    bottomLine += "+"
    output += bottomLine + "\n"

    console.log(output)

    return output
  }
}
