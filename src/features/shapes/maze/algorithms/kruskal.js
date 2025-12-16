// Kruskal's algorithm for maze generation
// Works on edges, creates a "random forest" that merges together

const N = 1
const S = 2
const E = 4
const W = 8
const IN = 0x10
const DX = { [E]: 1, [W]: -1, [N]: 0, [S]: 0 }
const DY = { [E]: 0, [W]: 0, [N]: -1, [S]: 1 }
const OPPOSITE = { [E]: W, [W]: E, [N]: S, [S]: N }

// Simple union-find data structure
class UnionFind {
  constructor(size) {
    this.parent = Array(size)
      .fill(0)
      .map((_, i) => i)
    this.rank = Array(size).fill(0)
  }

  find(x) {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]) // path compression
    }
    return this.parent[x]
  }

  union(x, y) {
    const rootX = this.find(x)
    const rootY = this.find(y)

    if (rootX === rootY) return false

    // Union by rank
    if (this.rank[rootX] < this.rank[rootY]) {
      this.parent[rootX] = rootY
    } else if (this.rank[rootX] > this.rank[rootY]) {
      this.parent[rootY] = rootX
    } else {
      this.parent[rootY] = rootX
      this.rank[rootX]++
    }

    return true
  }
}

export const kruskal = (grid, { width, height, rng, horizontalBias = 0 }) => {
  // Initialize all cells as separate sets
  const uf = new UnionFind(width * height)

  // Mark all cells as IN
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      grid[y][x] = IN
    }
  }

  // Create separate lists for horizontal and vertical edges
  const horizontalEdges = []
  const verticalEdges = []
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Add south edge (vertical)
      if (y < height - 1) {
        verticalEdges.push({ x, y, dir: S })
      }
      // Add east edge (horizontal)
      if (x < width - 1) {
        horizontalEdges.push({ x, y, dir: E })
      }
    }
  }

  // Shuffle each list independently
  const shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
  }
  shuffle(horizontalEdges)
  shuffle(verticalEdges)

  // Interleave edges based on horizontalBias
  // horizontalBias 0 = prefer horizontal passages, 10 = prefer vertical passages
  const horizontalProb = 0.9 - (horizontalBias * 0.08)
  const edges = []
  let hIdx = 0
  let vIdx = 0

  while (hIdx < horizontalEdges.length || vIdx < verticalEdges.length) {
    if (hIdx >= horizontalEdges.length) {
      edges.push(verticalEdges[vIdx++])
    } else if (vIdx >= verticalEdges.length) {
      edges.push(horizontalEdges[hIdx++])
    } else if (rng() < horizontalProb) {
      edges.push(horizontalEdges[hIdx++])
    } else {
      edges.push(verticalEdges[vIdx++])
    }
  }

  // Process edges
  for (const edge of edges) {
    const { x, y, dir } = edge
    const cell1 = y * width + x
    const nx = x + DX[dir]
    const ny = y + DY[dir]
    const cell2 = ny * width + nx

    // If cells are in different sets, connect them
    if (uf.union(cell1, cell2)) {
      grid[y][x] |= dir
      grid[ny][nx] |= OPPOSITE[dir]
    }
  }
}
