// Eller's algorithm for maze generation
// Processes one row at a time using disjoint sets - very memory efficient
// Creates horizontal bias similar to Sidewinder but more variety
// NOTE: Only works with rectangular grids (row-based processing)

export const eller = (grid, { rng, horizontalBias = 5 }) => {
  // Mark all cells as visited
  const allCells = grid.getAllCells()

  for (const cell of allCells) {
    grid.markVisited(cell)
  }

  // Set management: track which set each cell belongs to
  // Sets are identified by integers; cells in the same set are connected
  let nextSetId = 0
  const cellToSet = new Map() // cellKey -> setId
  const setToCells = new Map() // setId -> array of cells in current row

  // Helper to get or create a set for a cell
  const getSet = (cell) => {
    const key = grid.cellKey(cell)

    if (!cellToSet.has(key)) {
      cellToSet.set(key, nextSetId)
      setToCells.set(nextSetId, [cell])
      nextSetId++
    }

    return cellToSet.get(key)
  }

  // Helper to merge two sets (move all cells from set2 into set1)
  const mergeSets = (set1, set2) => {
    if (set1 === set2) return

    const cells2 = setToCells.get(set2) || []
    const cells1 = setToCells.get(set1) || []

    for (const cell of cells2) {
      cellToSet.set(grid.cellKey(cell), set1)
      cells1.push(cell)
    }

    setToCells.delete(set2)
  }

  // Helper to check if two cells are in the same set
  const sameSet = (cell1, cell2) => {
    return getSet(cell1) === getSet(cell2)
  }

  // Calculate probabilities based on horizontalBias (centered on 5 = neutral)
  // horizontalBias 0 = vertical feel, 5 = neutral, 10 = horizontal feel
  const mergeProbability = 0.1 + horizontalBias * 0.08 // 0.1 at 0, 0.5 at 5, 0.9 at 10

  // Vertical connection probability (per cell after the required first one)
  const verticalProbability = 0.9 - horizontalBias * 0.08 // 0.9 at 0, 0.5 at 5, 0.1 at 10

  // Process each row
  for (let y = 0; y < grid.height; y++) {
    const isLastRow = y === grid.height - 1

    // Get all cells in this row
    const rowCells = []
    for (let x = 0; x < grid.width; x++) {
      rowCells.push(grid.getCell(x, y))
    }

    // Initialize sets for cells in this row (new cells get new sets)
    for (const cell of rowCells) {
      getSet(cell)
    }

    // PHASE 1: Horizontal connections
    // Randomly join adjacent cells if they're in different sets
    for (let x = 0; x < grid.width - 1; x++) {
      const cell = rowCells[x]
      const eastCell = rowCells[x + 1]

      // On last row: must connect if in different sets
      // Otherwise: randomly connect if in different sets
      const shouldConnect = isLastRow
        ? !sameSet(cell, eastCell)
        : !sameSet(cell, eastCell) && rng() < mergeProbability

      if (shouldConnect) {
        grid.link(cell, eastCell)
        mergeSets(getSet(cell), getSet(eastCell))
      }
    }

    // PHASE 2: Vertical connections (skip on last row)
    if (!isLastRow) {
      // Group cells by their current set
      const setGroups = new Map()

      for (const cell of rowCells) {
        const setId = getSet(cell)
        if (!setGroups.has(setId)) {
          setGroups.set(setId, [])
        }
        setGroups.get(setId).push(cell)
      }

      // For each set, at least one cell must connect down
      for (const [setId, cells] of setGroups) {
        // Shuffle the cells in this set
        const shuffled = [...cells]
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(rng() * (i + 1))
          ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }

        // First cell always connects (required for maze connectivity)
        // Additional cells connect based on verticalProbability
        for (let i = 0; i < shuffled.length; i++) {
          const isRequired = i === 0
          if (!isRequired && rng() >= verticalProbability) {
            continue // Skip this cell
          }

          const cell = shuffled[i]
          const southCell = grid.getCell(cell.x, cell.y + 1)

          if (southCell) {
            grid.link(cell, southCell)

            // South cell inherits this cell's set
            const southKey = grid.cellKey(southCell)
            cellToSet.set(southKey, setId)

            if (!setToCells.has(setId)) {
              setToCells.set(setId, [])
            }
            setToCells.get(setId).push(southCell)
          }
        }
      }

      // Clear set tracking for cells that didn't connect down
      // (they'll get new sets when processing the next row)
      for (const cell of rowCells) {
        cellToSet.delete(grid.cellKey(cell))
      }

      // Also rebuild setToCells to only include next row's cells
      const nextRowSets = new Map()

      for (let x = 0; x < grid.width; x++) {
        const nextCell = grid.getCell(x, y + 1)
        const nextKey = grid.cellKey(nextCell)
        if (cellToSet.has(nextKey)) {
          const setId = cellToSet.get(nextKey)
          if (!nextRowSets.has(setId)) {
            nextRowSets.set(setId, [])
          }
          nextRowSets.get(setId).push(nextCell)
        }
      }
      setToCells.clear()
      for (const [setId, cells] of nextRowSets) {
        setToCells.set(setId, cells)
      }
    }
  }
}
