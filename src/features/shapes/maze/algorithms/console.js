// Utility for debugging maze generation - displays ASCII art in console

const S = 2
const E = 4

export const consoleDisplay = (grid, { width, height }) => {
  let mazeOutput = " " + "_".repeat(width * 2 - 1) + "\n"

  grid.forEach((row, y) => {
    mazeOutput += "|"

    row.forEach((cell, x) => {
      // determine if a south wall exists
      if (cell === 0 && y + 1 < height && grid[y + 1][x] === 0) {
        mazeOutput += " "
      } else {
        mazeOutput += (cell & S) !== 0 ? " " : "_"
      }

      // determine if an east wall exists
      if (cell === 0 && x + 1 < width && row[x + 1] === 0) {
        mazeOutput +=
          y + 1 < height && (grid[y + 1][x] === 0 || grid[y + 1][x + 1] === 0)
            ? " "
            : "_"
      } else if ((cell & E) !== 0) {
        mazeOutput += ((cell | row[x + 1]) & S) !== 0 ? " " : "_"
      } else {
        mazeOutput += "|"
      }
    })

    mazeOutput += "\n"
  })

  // eslint-disable-next-line no-console
  console.log(mazeOutput)
}
