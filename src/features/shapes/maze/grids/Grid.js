// Base class for all maze grids
// Provides shared functionality like finding hardest exits

const ARROW_HEAD_WIDTH = 0.625 // Arrow head width as fraction of wall length (25% bigger)
const ARROW_HEAD_HEIGHT = 0.8 // Arrow head height relative to width

export default class Grid {
  // Subclasses must implement:
  // - getEdgeCells() -> [{cell, direction, edge}, ...]
  // - getExitVertices(cell) -> [{x, y}, {x, y}] (wall endpoints)
  // - cellKey(cell) -> string
  // - getNeighbors(cell) -> [cell, ...]
  // - isLinked(cell1, cell2) -> boolean

  // Draw arrow marker inside the maze (no shaft)
  // Exit: tip touches wall, arrow head extends inward (pointing out)
  // Entrance: base touches wall, tip points into maze (pointing in)
  addExitArrow(
    walls,
    makeVertex,
    x1,
    y1,
    x2,
    y2,
    exitType,
    inwardDx,
    inwardDy,
  ) {
    const wallDx = x2 - x1
    const wallDy = y2 - y1
    const wallLen = Math.sqrt(wallDx * wallDx + wallDy * wallDy)

    const wallUnitX = wallDx / wallLen
    const wallUnitY = wallDy / wallLen
    const inLen = Math.sqrt(inwardDx * inwardDx + inwardDy * inwardDy)
    const inUnitX = inwardDx / inLen
    const inUnitY = inwardDy / inLen
    const headWidth = wallLen * ARROW_HEAD_WIDTH
    const headHeight = headWidth * ARROW_HEAD_HEIGHT
    const mx = (x1 + x2) / 2
    const my = (y1 + y2) / 2

    if (exitType === "exit") {
      // Exit: tip touches wall, base inside maze, pointing OUT

      // Tip on wall
      const tipX = mx
      const tipY = my

      // Base center inside maze (inward from tip)
      const baseCenterX = mx + inUnitX * headHeight
      const baseCenterY = my + inUnitY * headHeight

      // Base points
      const baseLeftX = baseCenterX - (wallUnitX * headWidth) / 2
      const baseLeftY = baseCenterY - (wallUnitY * headWidth) / 2
      const baseRightX = baseCenterX + (wallUnitX * headWidth) / 2
      const baseRightY = baseCenterY + (wallUnitY * headWidth) / 2

      // Draw arrow head - connected through tip (on wall)
      walls.push([makeVertex(tipX, tipY), makeVertex(baseLeftX, baseLeftY)])
      walls.push([
        makeVertex(baseLeftX, baseLeftY),
        makeVertex(baseCenterX, baseCenterY),
      ])
      walls.push([
        makeVertex(baseCenterX, baseCenterY),
        makeVertex(baseRightX, baseRightY),
      ])
      walls.push([makeVertex(baseRightX, baseRightY), makeVertex(tipX, tipY)])
    } else {
      // Entrance: base touches wall, tip inside maze, pointing IN

      // Base center on wall
      const baseCenterX = mx
      const baseCenterY = my

      // Base points (on wall)
      const baseLeftX = mx - (wallUnitX * headWidth) / 2
      const baseLeftY = my - (wallUnitY * headWidth) / 2
      const baseRightX = mx + (wallUnitX * headWidth) / 2
      const baseRightY = my + (wallUnitY * headWidth) / 2

      // Tip inside maze (inward from base)
      const tipX = mx + inUnitX * headHeight
      const tipY = my + inUnitY * headHeight

      // Draw arrow head - connected through baseCenter (on wall)
      walls.push([
        makeVertex(baseCenterX, baseCenterY),
        makeVertex(baseLeftX, baseLeftY),
      ])
      walls.push([makeVertex(baseLeftX, baseLeftY), makeVertex(tipX, tipY)])
      walls.push([makeVertex(tipX, tipY), makeVertex(baseRightX, baseRightY)])
      walls.push([
        makeVertex(baseRightX, baseRightY),
        makeVertex(baseCenterX, baseCenterY),
      ])
    }
  }

  // Find the two edge cells with maximum distance (hardest path)
  findHardestExits() {
    const edgeCells = this.getEdgeCells()

    if (edgeCells.length < 2) {
      return null
    }

    const bfsDistances = (startCell) => {
      const distances = new Map()
      const queue = [startCell]

      distances.set(this.cellKey(startCell), 0)

      while (queue.length > 0) {
        const current = queue.shift()
        const currentDist = distances.get(this.cellKey(current))

        for (const neighbor of this.getNeighbors(current)) {
          if (this.isLinked(current, neighbor)) {
            const neighborKey = this.cellKey(neighbor)

            if (!distances.has(neighborKey)) {
              distances.set(neighborKey, currentDist + 1)
              queue.push(neighbor)
            }
          }
        }
      }

      return distances
    }

    let maxDistance = -1
    let bestStart = null
    let bestEnd = null

    // Check all pairs of edge cells
    for (let i = 0; i < edgeCells.length; i++) {
      const startEdge = edgeCells[i]
      const distances = bfsDistances(startEdge.cell)

      for (let j = i + 1; j < edgeCells.length; j++) {
        const endEdge = edgeCells[j]
        const dist = distances.get(this.cellKey(endEdge.cell))

        if (dist !== undefined && dist > maxDistance) {
          maxDistance = dist
          bestStart = startEdge
          bestEnd = endEdge
        }
      }
    }

    if (!bestStart || !bestEnd) {
      return null
    }

    // Mark the cells with their exit directions
    bestStart.cell.exitDirection = bestStart.direction
    bestEnd.cell.exitDirection = bestEnd.direction

    return {
      startCell: bestStart.cell,
      endCell: bestEnd.cell,
      distance: maxDistance,
    }
  }
}
