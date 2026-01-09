// Recursive Backtracker algorithm for maze generation
// Creates long, winding passages using depth-first search
// Works with any grid type (RectangularGrid, PolarGrid, etc.)

export const backtracker = (grid, { rng, straightness = 0 }) => {
  const stack = []
  const startCell = grid.getRandomCell()

  grid.markVisited(startCell)
  stack.push({ cell: startCell, lastNeighbor: null })

  while (stack.length > 0) {
    const { cell, lastNeighbor } = stack[stack.length - 1]

    // Get unvisited neighbors
    const neighbors = grid.getNeighbors(cell)
    const unvisitedNeighbors = neighbors.filter((n) => !grid.isVisited(n))

    if (unvisitedNeighbors.length > 0) {
      let chosenNeighbor

      // Apply straightness bias if we have a previous neighbor and straightness > 0
      // For straightness, we try to continue in a "similar direction"
      // by preferring the neighbor that is furthest from the previous cell
      if (
        lastNeighbor !== null &&
        straightness > 0 &&
        unvisitedNeighbors.length > 1
      ) {
        const continueProb = straightness * 0.09

        if (rng() < continueProb) {
          // Find the neighbor most "opposite" to where we came from
          // This approximates continuing straight
          // For rectangular grids: opposite of lastNeighbor
          // For polar grids: similar concept applies
          const lastKey = grid.cellKey(lastNeighbor)
          const oppositeNeighbor = unvisitedNeighbors.find((n) => {
            // Check if this neighbor has lastNeighbor as a neighbor
            // (meaning it's "continuing" past the current cell)
            const nNeighbors = grid.getNeighbors(n)
            return !nNeighbors.some((nn) => grid.cellKey(nn) === lastKey)
          })

          if (oppositeNeighbor) {
            chosenNeighbor = oppositeNeighbor
          }
        }
      }

      // If no bias applied or bias didn't trigger, choose randomly
      if (!chosenNeighbor) {
        const idx = Math.floor(rng() * unvisitedNeighbors.length)
        chosenNeighbor = unvisitedNeighbors[idx]
      }

      // Link current cell to chosen neighbor
      grid.link(cell, chosenNeighbor)
      grid.markVisited(chosenNeighbor)

      // Push neighbor onto stack, tracking where we came from
      stack.push({ cell: chosenNeighbor, lastNeighbor: cell })
    } else {
      // Backtrack
      stack.pop()
    }
  }
}
