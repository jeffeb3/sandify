/* global console */
import Victor from "victor"
import Grid from "./Grid"

// Rectangular grid for standard mazes
// Implements the same interface as PolarGrid for algorithm compatibility

export default class RectangularGrid extends Grid {
  constructor(width, height, rng) {
    super()
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

  // Get the two vertices of an exit wall for a cell
  // Returns [v1, v2] where v1 and v2 are {x, y} objects
  getExitVertices(cell) {
    const { x, y } = cell
    const dir = cell.exitDirection

    switch (dir) {
      case "n":
        return [
          { x, y: 0 },
          { x: x + 1, y: 0 },
        ]
      case "s":
        return [
          { x, y: this.height },
          { x: x + 1, y: this.height },
        ]
      case "w":
        return [
          { x: 0, y },
          { x: 0, y: y + 1 },
        ]
      case "e":
        return [
          { x: this.width, y },
          { x: this.width, y: y + 1 },
        ]
      default:
        return null
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

    const makeVertex = (x, y) => {
      const key = `${x},${y}`

      if (!vertexCache.has(key)) {
        vertexCache.set(key, new Victor(x, y))
      }

      return vertexCache.get(key)
    }

    // Inward directions for each edge (into the maze)
    const inwardDir = {
      n: { dx: 0, dy: 1 },
      s: { dx: 0, dy: -1 },
      w: { dx: 1, dy: 0 },
      e: { dx: -1, dy: 0 },
    }

    // Draw exit wall split at midpoint + arrow on top
    const addExitWithArrow = (x1, y1, x2, y2, direction, exitType) => {
      const { dx, dy } = inwardDir[direction]
      const mx = (x1 + x2) / 2
      const my = (y1 + y2) / 2

      // Split wall at midpoint so arrow connects to graph
      walls.push([makeVertex(x1, y1), makeVertex(mx, my)])
      walls.push([makeVertex(mx, my), makeVertex(x2, y2)])

      // Add arrow (connects at midpoint)
      this.addExitArrow(walls, makeVertex, x1, y1, x2, y2, exitType, dx, dy)
    }

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const cell = this.getCell(x, y)

        // North wall (top of cell)
        if (y === 0) {
          if (cell.exitDirection === "n") {
            addExitWithArrow(x, y, x + 1, y, "n", cell.exitType)
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
            addExitWithArrow(x, y, x, y + 1, "w", cell.exitType)
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
            addExitWithArrow(x, y + 1, x + 1, y + 1, "s", cell.exitType)
          } else {
            walls.push([makeVertex(x, y + 1), makeVertex(x + 1, y + 1)])
          }
        }

        // East wall (right edge only for last column)
        if (x === this.width - 1) {
          if (cell.exitDirection === "e") {
            addExitWithArrow(x + 1, y, x + 1, y + 1, "e", cell.exitType)
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
