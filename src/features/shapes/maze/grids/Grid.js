// Base class for all maze grids
// Provides shared functionality like finding hardest exits

import Victor from "victor"

const ARROW_HEAD_WIDTH = 0.625 // Arrow head width as fraction of wall length (25% bigger)
const ARROW_HEAD_HEIGHT = 0.8 // Arrow head height relative to width

export default class Grid {
  // Subclasses must implement:
  // - getEdgeCells() -> [{cell, direction, edge}, ...]
  // - cellKey(cell) -> string
  // - getNeighbors(cell) -> [cell, ...]

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

  // Factory to create a cached vertex function
  // round=true rounds to 6 decimals (needed for non-integer coordinates)
  createMakeVertex(vertexCache, round = true) {
    return (x, y) => {
      const rx = round ? Math.round(x * 1000000) / 1000000 : x
      const ry = round ? Math.round(y * 1000000) / 1000000 : y
      const key = `${rx},${ry}`

      if (!vertexCache.has(key)) {
        vertexCache.set(key, new Victor(rx, ry))
      }

      return vertexCache.get(key)
    }
  }

  // Helper to add an exit arrow with wall splitting
  // This handles the common pattern: split wall, scale coords, draw arrow, store edges
  addExitWithArrow(
    walls,
    makeVertex,
    cell,
    x1,
    y1,
    x2,
    y2,
    inwardDx,
    inwardDy,
    arrowScale = 1.0,
  ) {
    const mx = (x1 + x2) / 2
    const my = (y1 + y2) / 2

    // Split wall at midpoint so arrow connects to graph
    walls.push([makeVertex(x1, y1), makeVertex(mx, my)])
    walls.push([makeVertex(mx, my), makeVertex(x2, y2)])

    // Scale wall coords for arrow sizing
    const sx1 = mx + (x1 - mx) * arrowScale
    const sy1 = my + (y1 - my) * arrowScale
    const sx2 = mx + (x2 - mx) * arrowScale
    const sy2 = my + (y2 - my) * arrowScale

    // Add arrow (connects at midpoint) and store edges on cell
    const arrow = this.addExitArrow(
      walls,
      makeVertex,
      sx1,
      sy1,
      sx2,
      sy2,
      cell.exitType,
      inwardDx,
      inwardDy,
    )

    cell.arrowEdges = arrow.edges
  }

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

    // Return edges (Victor objects that go into walls/graph)
    return {
      edges: [
        [makeVertex(tipX, tipY), makeVertex(baseLeftX, baseLeftY)],
        [makeVertex(baseLeftX, baseLeftY), makeVertex(baseCenterX, baseCenterY)],
        [makeVertex(baseCenterX, baseCenterY), makeVertex(baseRightX, baseRightY)],
        [makeVertex(baseRightX, baseRightY), makeVertex(tipX, tipY)],
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
