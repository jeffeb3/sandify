// Wilson's algorithm for maze generation
// adapted from https://weblog.jamisbuck.org/2011/1/20/maze-generation-wilson-s-algorithm

const N = 1
const S = 2
const E = 4
const W = 8
const DX = { [E]: 1, [W]: -1, [N]: 0, [S]: 0 }
const DY = { [E]: 0, [W]: 0, [N]: -1, [S]: 1 }
const OPPOSITE = { [E]: W, [W]: E, [N]: S, [S]: N }

const walk = (grid, rng) => {
  while (true) {
    let cx, cy

    do {
      cx = Math.floor(rng() * grid[0].length)
      cy = Math.floor(rng() * grid.length)
    } while (grid[cy][cx] !== 0) // find an unvisited cell

    const visits = new Map()

    visits.set(`${cx},${cy}`, 0) // store direction as 0 initially, meaning no direction yet

    const startX = cx
    const startY = cy
    let walking = true

    while (walking) {
      walking = false

      // shuffle directions using the seeded random
      const directions = [N, S, E, W].sort(() => rng() - 0.5)

      for (const dir of directions) {
        const nx = cx + DX[dir]
        const ny = cy + DY[dir]

        if (
          nx >= 0 &&
          ny >= 0 &&
          ny < grid.length &&
          nx < grid[ny].length
        ) {
          visits.set(`${cx},${cy}`, dir)

          if (grid[ny][nx] !== 0) {
            // found a visited cell, break the loop and record the path
            walking = false
            break
          } else {
            // move to the next cell
            cx = nx
            cy = ny
            walking = true
            break
          }
        }
      }
    }

    const path = []
    let x = startX
    let y = startY

    while (true) {
      const dir = visits.get(`${x},${y}`)

      if (dir === undefined || dir === 0) break

      path.push([x, y, dir])
      x = x + DX[dir]
      y = y + DY[dir]
    }

    return path
  }
}

export const wilson = (grid, { width, height, rng }) => {
  let remaining = width * height - 1

  while (remaining > 0) {
    const currentPath = walk(grid, rng)

    currentPath.forEach(([x, y, dir]) => {
      const nx = x + DX[dir]
      const ny = y + DY[dir]

      grid[y][x] |= dir
      grid[ny][nx] |= OPPOSITE[dir]

      remaining -= 1
    })
  }
}
