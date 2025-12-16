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

export const prim = (grid, { width, height, rng, branchLevel = 0 }) => {
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
    // Pick cell from frontier based on branchLevel
    // branchLevel 0 = bushy (pick from start/FIFO), 10 = winding (pick from end/LIFO)
    let idx
    // Use power distribution to bias selection
    // power > 1 → picks from start (bushy), power < 1 → picks from end (winding)
    const t = branchLevel / 10 // 0 (bushy) to 1 (winding)
    const power = 2 - 1.5 * t // 2 (bushy) to 0.5 (winding)
    idx = Math.floor(Math.pow(rng(), power) * frontier.length)
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
