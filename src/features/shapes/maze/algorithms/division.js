// Recursive Division algorithm for maze generation
// Divides space with walls, leaving passages - creates long straight corridors

const N = 1
const S = 2
const E = 4
const W = 8
const IN = 0x10
const DX = { [E]: 1, [W]: -1, [N]: 0, [S]: 0 }
const DY = { [E]: 0, [W]: 0, [N]: -1, [S]: 1 }
const OPPOSITE = { [E]: W, [W]: E, [N]: S, [S]: N }

const divide = (grid, x, y, width, height, rng) => {
  if (width < 2 || height < 2) return

  const horizontal = height > width || (height === width && rng() < 0.5)

  if (horizontal) {
    // Divide horizontally
    const wallY = y + Math.floor(rng() * (height - 1))
    const passageX = x + Math.floor(rng() * width)

    // Add horizontal wall with passage
    for (let wx = x; wx < x + width; wx++) {
      if (wx !== passageX) {
        // Remove south passage from cells above the wall
        grid[wallY][wx] &= ~S
        // Remove north passage from cells below the wall
        if (wallY + 1 < grid.length) {
          grid[wallY + 1][wx] &= ~N
        }
      }
    }

    // Recursively divide the two sections
    divide(grid, x, y, width, wallY - y + 1, rng)
    divide(grid, x, wallY + 1, width, y + height - wallY - 1, rng)
  } else {
    // Divide vertically
    const wallX = x + Math.floor(rng() * (width - 1))
    const passageY = y + Math.floor(rng() * height)

    // Add vertical wall with passage
    for (let wy = y; wy < y + height; wy++) {
      if (wy !== passageY) {
        // Remove east passage from cells left of the wall
        grid[wy][wallX] &= ~E
        // Remove west passage from cells right of the wall
        if (wallX + 1 < grid[wy].length) {
          grid[wy][wallX + 1] &= ~W
        }
      }
    }

    // Recursively divide the two sections
    divide(grid, x, y, wallX - x + 1, height, rng)
    divide(grid, wallX + 1, y, x + width - wallX - 1, height, rng)
  }
}

export const division = (grid, width, height, rng) => {
  // Start with all passages open (no walls)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let cell = IN

      if (y > 0) cell |= N
      if (y < height - 1) cell |= S
      if (x > 0) cell |= W
      if (x < width - 1) cell |= E

      grid[y][x] = cell
    }
  }

  // Recursively divide the space
  divide(grid, 0, 0, width, height, rng)
}
