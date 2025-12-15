// Prim's algorithm for maze generation
// Creates lots of short branches and dead ends - "bushy" appearance

const N = 1
const S = 2
const E = 4
const W = 8
const IN = 0x10
const DX = { [E]: 1, [W]: -1, [N]: 0, [S]: 0 }
const DY = { [E]: 0, [W]: 0, [N]: -1, [S]: 1 }
const OPPOSITE = { [E]: W, [W]: E, [N]: S, [S]: N }

export const prim = (grid, width, height, rng) => {
  const frontier = []

  // Start with a random cell
  const startX = Math.floor(rng() * width)
  const startY = Math.floor(rng() * height)

  grid[startY][startX] = IN

  // Add neighbors to frontier
  const addFrontier = (x, y) => {
    const directions = [N, S, E, W]
    for (const dir of directions) {
      const nx = x + DX[dir]
      const ny = y + DY[dir]

      if (
        nx >= 0 &&
        ny >= 0 &&
        ny < height &&
        nx < width &&
        grid[ny][nx] === 0
      ) {
        grid[ny][nx] = OPPOSITE[dir] // mark with direction back to parent
        frontier.push([nx, ny])
      }
    }
  }

  addFrontier(startX, startY)

  // Process frontier
  while (frontier.length > 0) {
    // Pick random cell from frontier
    const idx = Math.floor(rng() * frontier.length)
    const [fx, fy] = frontier[idx]
    frontier.splice(idx, 1)

    // Get direction back to parent (stored in grid)
    const dir = grid[fy][fx]

    // Find the parent cell (go in the stored direction)
    const px = fx + DX[dir]
    const py = fy + DY[dir]

    // Connect frontier cell to parent
    grid[fy][fx] = IN | dir
    grid[py][px] |= OPPOSITE[dir]

    // Add new neighbors to frontier
    addFrontier(fx, fy)
  }
}
