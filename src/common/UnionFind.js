// Union-Find (Disjoint Set Union) data structure
// Used for connected component tracking, Kruskal's MST, cycle detection, etc.

export default class UnionFind {
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
