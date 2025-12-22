// Kruskal's algorithm for maze generation
// Works on edges, creates a "random forest" that merges together
// Works with any grid type (RectangularGrid, PolarGrid, etc.)

import UnionFind from "@/common/UnionFind"

export const kruskal = (grid, { rng }) => {
  const uf = new UnionFind()
  const allCells = grid.getAllCells()

  // Initialize union-find with all cells
  for (const cell of allCells) {
    const key = grid.cellKey(cell)
    uf.makeSet(key)
    grid.markVisited(cell)
  }

  // Collect all unique edges (cell pairs)
  const edges = []
  const seenEdges = new Set()

  for (const cell of allCells) {
    const cellKey = grid.cellKey(cell)
    for (const neighbor of grid.getNeighbors(cell)) {
      const neighborKey = grid.cellKey(neighbor)
      // Create a canonical edge key to avoid duplicates
      const edgeKey = [cellKey, neighborKey].sort().join("|")
      if (!seenEdges.has(edgeKey)) {
        seenEdges.add(edgeKey)
        edges.push({ cell, neighbor })
      }
    }
  }

  // Shuffle edges
  for (let i = edges.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[edges[i], edges[j]] = [edges[j], edges[i]]
  }

  // Process edges - connect if in different sets
  for (const { cell, neighbor } of edges) {
    const cellKey = grid.cellKey(cell)
    const neighborKey = grid.cellKey(neighbor)

    if (uf.union(cellKey, neighborKey)) {
      grid.link(cell, neighbor)
    }
  }
}
