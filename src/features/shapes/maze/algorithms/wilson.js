// Wilson's algorithm for maze generation
// Uses loop-erased random walks to generate uniform spanning trees
// Works with any grid type (RectangularGrid, PolarGrid, etc.)

export const wilson = (grid, { rng }) => {
  const allCells = grid.getAllCells()

  // Track visited cells (part of the maze tree)
  const visited = new Set()

  // Pick a random cell to seed the maze tree
  const seedCell = grid.getRandomCell()

  grid.markVisited(seedCell)
  visited.add(grid.cellKey(seedCell))

  // Keep going until all cells are in the maze
  while (visited.size < allCells.length) {
    // Find an unvisited cell to start the walk
    let startCell
    do {
      startCell = grid.getRandomCell()
    } while (visited.has(grid.cellKey(startCell)))

    // Perform loop-erased random walk
    // path: array of cells representing the walk
    const path = [startCell]

    let current = startCell
    while (!visited.has(grid.cellKey(current))) {
      const neighbors = grid.getNeighbors(current)
      const next = neighbors[Math.floor(rng() * neighbors.length)]

      // Check if we've visited this cell in the current walk (loop)
      const existingIndex = path.findIndex((c) => grid.cellEquals(c, next))

      if (existingIndex >= 0) {
        // Loop detected - erase everything after the first visit
        path.splice(existingIndex + 1)
        current = path[path.length - 1]
      } else {
        // Continue the walk
        path.push(next)
        current = next
      }
    }

    // Carve the path into the maze
    for (let i = 0; i < path.length - 1; i++) {
      const cell = path[i]
      const next = path[i + 1]

      grid.link(cell, next)
      grid.markVisited(cell)
      visited.add(grid.cellKey(cell))
    }
  }
}
