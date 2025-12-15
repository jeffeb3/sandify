// Sidewinder algorithm for maze generation
// Works row by row, creates horizontal bias with long east-west corridors

const N = 1
const S = 2
const E = 4
const W = 8
const IN = 0x10
const OPPOSITE = { [E]: W, [W]: E, [N]: S, [S]: N }

export const sidewinder = (grid, width, height, rng) => {
  // Mark all cells as IN
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      grid[y][x] = IN
    }
  }

  // Process each row
  for (let y = 0; y < height; y++) {
    let run = []

    for (let x = 0; x < width; x++) {
      run.push(x)

      // At east boundary or randomly decide to close out the run
      const atEastBoundary = x === width - 1
      const atNorthBoundary = y === 0
      const shouldCloseRun = atEastBoundary || (!atNorthBoundary && rng() < 0.5)

      if (shouldCloseRun) {
        // Pick random cell from run and carve north (unless at north boundary)
        if (!atNorthBoundary) {
          const randomIdx = Math.floor(rng() * run.length)
          const cellX = run[randomIdx]

          grid[y][cellX] |= N
          grid[y - 1][cellX] |= S
        }

        // Clear the run
        run = []
      } else {
        // Carve east
        grid[y][x] |= E
        grid[y][x + 1] |= W
      }
    }
  }
}
