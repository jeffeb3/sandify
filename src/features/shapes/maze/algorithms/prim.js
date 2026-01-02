// Prim's algorithm for maze generation
// Creates lots of short branches and dead ends - "bushy" appearance
// Works with any grid type (RectangularGrid, PolarGrid, etc.)

export const prim = (grid, { rng, branchLevel = 5 }) => {
  const frontier = [] // Array of { cell, parent } objects
  const inFrontier = new Set() // Track cells already in frontier

  // Start with a random cell
  const startCell = grid.getRandomCell()

  grid.markVisited(startCell)

  // Add neighbors to frontier
  const addToFrontier = (cell) => {
    for (const neighbor of grid.getNeighbors(cell)) {
      const key = grid.cellKey(neighbor)
      if (!grid.isVisited(neighbor) && !inFrontier.has(key)) {
        frontier.push({ cell: neighbor, parent: cell })
        inFrontier.add(key)
      }
    }
  }

  addToFrontier(startCell)

  // Process frontier
  while (frontier.length > 0) {
    // Pick cell from frontier based on branchLevel
    // branchLevel 0 = bushy (random), 5 = balanced, 10 = winding (LIFO-like)
    let idx
    const t = branchLevel / 10 // 0 to 1
    const power = 2 - 1.5 * t // 2 (bushy) to 0.5 (winding)
    idx = Math.floor(Math.pow(rng(), power) * frontier.length)

    const { cell, parent } = frontier[idx]

    frontier.splice(idx, 1)

    // Connect frontier cell to parent
    grid.link(cell, parent)
    grid.markVisited(cell)

    // Add new neighbors to frontier
    addToFrontier(cell)
  }
}
