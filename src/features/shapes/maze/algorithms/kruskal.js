// Kruskal's algorithm for maze generation
// Works on edges, creates a "random forest" that merges together
// Works with any grid type (RectangularGrid, PolarGrid, etc.)

// Simple union-find data structure using cell keys
class UnionFind {
  constructor() {
    this.parent = new Map()
    this.rank = new Map()
  }

  makeSet(key) {
    if (!this.parent.has(key)) {
      this.parent.set(key, key)
      this.rank.set(key, 0)
    }
  }

  find(key) {
    if (this.parent.get(key) !== key) {
      this.parent.set(key, this.find(this.parent.get(key))) // path compression
    }
    return this.parent.get(key)
  }

  union(key1, key2) {
    const root1 = this.find(key1)
    const root2 = this.find(key2)

    if (root1 === root2) return false

    // Union by rank
    const rank1 = this.rank.get(root1)
    const rank2 = this.rank.get(root2)

    if (rank1 < rank2) {
      this.parent.set(root1, root2)
    } else if (rank1 > rank2) {
      this.parent.set(root2, root1)
    } else {
      this.parent.set(root2, root1)
      this.rank.set(root1, rank1 + 1)
    }

    return true
  }
}

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
