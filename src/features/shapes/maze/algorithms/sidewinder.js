// Sidewinder algorithm for maze generation
// Works row by row, creates horizontal bias with long east-west corridors
// NOTE: Only works with rectangular grids

export const sidewinder = (grid, { rng, straightness = 0 }) => {
  // Mark all cells as visited
  const allCells = grid.getAllCells()

  for (const cell of allCells) {
    grid.markVisited(cell)
  }

  // Calculate close probability based on straightness
  // straightness 0 = 0.5 (default), straightness 10 = 0.1 (long corridors)
  const closeProbability = 0.5 - straightness * 0.04

  // Process each row
  for (let y = 0; y < grid.height; y++) {
    const run = []

    for (let x = 0; x < grid.width; x++) {
      const cell = grid.getCell(x, y)

      run.push(cell)

      // At east boundary or randomly decide to close out the run
      const atEastBoundary = x === grid.width - 1
      const atNorthBoundary = y === 0
      const shouldCloseRun =
        atEastBoundary || (!atNorthBoundary && rng() < closeProbability)

      if (shouldCloseRun) {
        // Pick random cell from run and carve north (unless at north boundary)
        if (!atNorthBoundary) {
          const randomIdx = Math.floor(rng() * run.length)
          const runCell = run[randomIdx]
          const northCell = grid.getCell(runCell.x, runCell.y - 1)

          if (northCell) {
            grid.link(runCell, northCell)
          }
        }

        // Clear the run
        run.length = 0
      } else {
        // Carve east
        const eastCell = grid.getCell(x + 1, y)

        if (eastCell) {
          grid.link(cell, eastCell)
        }
      }
    }
  }
}
