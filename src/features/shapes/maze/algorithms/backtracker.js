// Recursive Backtracker algorithm for maze generation
// Creates long, winding passages using depth-first search

const N = 1
const S = 2
const E = 4
const W = 8
const IN = 0x10
const DX = { [E]: 1, [W]: -1, [N]: 0, [S]: 0 }
const DY = { [E]: 0, [W]: 0, [N]: -1, [S]: 1 }
const OPPOSITE = { [E]: W, [W]: E, [N]: S, [S]: N }

export const backtracker = (grid, width, height, rng) => {
  const stack = []
  const startX = Math.floor(rng() * width)
  const startY = Math.floor(rng() * height)

  grid[startY][startX] = IN
  stack.push([startX, startY])

  while (stack.length > 0) {
    const [cx, cy] = stack[stack.length - 1]
    const unvisitedNeighbors = []

    // Check all four directions for unvisited neighbors
    const directions = [N, S, E, W]
    for (const dir of directions) {
      const nx = cx + DX[dir]
      const ny = cy + DY[dir]

      if (
        nx >= 0 &&
        ny >= 0 &&
        ny < height &&
        nx < width &&
        grid[ny][nx] === 0
      ) {
        unvisitedNeighbors.push({ dir, nx, ny })
      }
    }

    if (unvisitedNeighbors.length > 0) {
      // Choose a random unvisited neighbor
      const idx = Math.floor(rng() * unvisitedNeighbors.length)
      const { dir, nx, ny } = unvisitedNeighbors[idx]

      // Remove wall between current cell and chosen neighbor
      grid[cy][cx] |= dir
      grid[ny][nx] |= OPPOSITE[dir] | IN

      // Push neighbor onto stack
      stack.push([nx, ny])
    } else {
      // Backtrack
      stack.pop()
    }
  }
}
