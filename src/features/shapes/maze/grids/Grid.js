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

    let tipX, tipY, baseCenterX, baseCenterY

    let baseLeftX, baseLeftY, baseRightX, baseRightY

    if (exitType === "exit") {
      // Exit: tip touches wall, base inside maze, pointing OUT

      // Tip on wall
      tipX = mx
      tipY = my

      // Base center inside maze (inward from tip)
      baseCenterX = mx + inUnitX * headHeight
      baseCenterY = my + inUnitY * headHeight

      // Base points
      baseLeftX = baseCenterX - (wallUnitX * headWidth) / 2
      baseLeftY = baseCenterY - (wallUnitY * headWidth) / 2
      baseRightX = baseCenterX + (wallUnitX * headWidth) / 2
      baseRightY = baseCenterY + (wallUnitY * headWidth) / 2

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
      baseCenterX = mx
      baseCenterY = my

      // Base points (on wall)
      baseLeftX = mx - (wallUnitX * headWidth) / 2
      baseLeftY = my - (wallUnitY * headWidth) / 2
      baseRightX = mx + (wallUnitX * headWidth) / 2
      baseRightY = my + (wallUnitY * headWidth) / 2

      // Tip inside maze (inward from base)
      tipX = mx + inUnitX * headHeight
      tipY = my + inUnitY * headHeight

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

    // Build arrow vertices (same Victor objects that go into walls/graph)
    const tipV = makeVertex(tipX, tipY)
    const baseLeftV = makeVertex(baseLeftX, baseLeftY)
    const baseCenterV = makeVertex(baseCenterX, baseCenterY)
    const baseRightV = makeVertex(baseRightX, baseRightY)

    // Return vertices and edges
    return {
      tip: tipV,
      base: baseCenterV,
      edges: [
        [tipV, baseLeftV],
        [baseLeftV, baseCenterV],
        [baseCenterV, baseRightV],
        [baseRightV, tipV],
      ],
    }
  }

  // Find the two edge cells with maximum distance (hardest path)
  // Returns { startCell, endCell, distance, path } where path is array of cells
  findHardestExits() {
    const edgeCells = this.getEdgeCells()

    if (edgeCells.length < 2) {
      return null
    }

    // BFS that tracks both distances and parent pointers for path reconstruction
    const bfsWithParents = (startCell) => {
      const distances = new Map()
      const parents = new Map()
      const queue = [startCell]

      distances.set(this.cellKey(startCell), 0)
      parents.set(this.cellKey(startCell), null)

      while (queue.length > 0) {
        const current = queue.shift()
        const currentDist = distances.get(this.cellKey(current))

        for (const neighbor of this.getNeighbors(current)) {
          if (this.isLinked(current, neighbor)) {
            const neighborKey = this.cellKey(neighbor)

            if (!distances.has(neighborKey)) {
              distances.set(neighborKey, currentDist + 1)
              parents.set(neighborKey, current)
              queue.push(neighbor)
            }
          }
        }
      }

      return { distances, parents }
    }

    let maxDistance = -1
    let bestStart = null
    let bestEnd = null
    let bestParents = null

    // Check all pairs of edge cells
    for (let i = 0; i < edgeCells.length; i++) {
      const startEdge = edgeCells[i]
      const { distances, parents } = bfsWithParents(startEdge.cell)

      for (let j = i + 1; j < edgeCells.length; j++) {
        const endEdge = edgeCells[j]
        const dist = distances.get(this.cellKey(endEdge.cell))

        if (dist !== undefined && dist > maxDistance) {
          maxDistance = dist
          bestStart = startEdge
          bestEnd = endEdge
          bestParents = parents
        }
      }
    }

    if (!bestStart || !bestEnd) {
      return null
    }

    // Reconstruct path from start to end using parent pointers
    const path = []
    let current = bestEnd.cell

    while (current !== null) {
      path.unshift(current)
      current = bestParents.get(this.cellKey(current))
    }

    // Mark the cells with their exit directions
    bestStart.cell.exitDirection = bestStart.direction
    bestEnd.cell.exitDirection = bestEnd.direction

    return {
      startCell: bestStart.cell,
      endCell: bestEnd.cell,
      distance: maxDistance,
      path,
    }
  }
}
