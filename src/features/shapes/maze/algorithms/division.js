// Recursive Division algorithm for maze generation
// Divides space with walls, leaving passages - creates long straight corridors
// NOTE: Only works with rectangular grids

const divide = (grid, cells, rng, horizontalBias) => {
  if (cells.length < 2) return

  // Find bounds
  const xs = cells.map((c) => c.x)
  const ys = cells.map((c) => c.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)

  const width = maxX - minX + 1
  const height = maxY - minY + 1

  if (width < 2 && height < 2) return

  // Calculate horizontal probability based on horizontalBias
  const horizontalProb = 0.1 + horizontalBias * 0.08
  const horizontal =
    height > width || (height === width && rng() < horizontalProb)

  if (horizontal && height >= 2) {
    // Divide horizontally - pick a y value to put wall below
    const wallY = minY + Math.floor(rng() * (height - 1))

    // Get cells in the wall row and the row below
    const topCells = cells.filter((c) => c.y === wallY)
    const bottomCells = cells.filter((c) => c.y === wallY + 1)

    // Pick one passage to leave open
    const passageX = minX + Math.floor(rng() * width)

    // Unlink all except the passage
    for (const topCell of topCells) {
      if (topCell.x === passageX) continue
      const bottomCell = bottomCells.find((c) => c.x === topCell.x)
      if (bottomCell) {
        grid.unlink(topCell, bottomCell)
      }
    }

    // Recursively divide top and bottom sections
    const topSection = cells.filter((c) => c.y <= wallY)
    const bottomSection = cells.filter((c) => c.y > wallY)

    divide(grid, topSection, rng, horizontalBias)
    divide(grid, bottomSection, rng, horizontalBias)
  } else if (width >= 2) {
    // Divide vertically - pick an x value to put wall right of
    const wallX = minX + Math.floor(rng() * (width - 1))

    // Get cells in the wall column and the column to the right
    const leftCells = cells.filter((c) => c.x === wallX)
    const rightCells = cells.filter((c) => c.x === wallX + 1)

    // Pick one passage to leave open
    const passageY = minY + Math.floor(rng() * height)

    // Unlink all except the passage
    for (const leftCell of leftCells) {
      if (leftCell.y === passageY) continue
      const rightCell = rightCells.find((c) => c.y === leftCell.y)
      if (rightCell) {
        grid.unlink(leftCell, rightCell)
      }
    }

    // Recursively divide left and right sections
    const leftSection = cells.filter((c) => c.x <= wallX)
    const rightSection = cells.filter((c) => c.x > wallX)

    divide(grid, leftSection, rng, horizontalBias)
    divide(grid, rightSection, rng, horizontalBias)
  }
}

export const division = (grid, { rng, horizontalBias = 5 }) => {
  const allCells = grid.getAllCells()

  // Start with all cells fully connected
  for (const cell of allCells) {
    grid.markVisited(cell)
    for (const neighbor of grid.getNeighbors(cell)) {
      grid.link(cell, neighbor)
    }
  }

  // Recursively divide
  divide(grid, allCells, rng, horizontalBias)
}
