import UnionFind from "./UnionFind"

describe("UnionFind", () => {
  let uf

  beforeEach(() => {
    uf = new UnionFind()
  })

  describe("makeSet", () => {
    it("creates a new set with element as its own parent", () => {
      uf.makeSet("a")
      expect(uf.find("a")).toBe("a")
    })

    it("does not overwrite existing sets", () => {
      uf.makeSet("a")
      uf.makeSet("b")
      uf.union("a", "b")
      uf.makeSet("a") // try to recreate
      expect(uf.find("a")).toBe(uf.find("b"))
    })
  })

  describe("find", () => {
    it("returns the root of a single element set", () => {
      uf.makeSet("x")
      expect(uf.find("x")).toBe("x")
    })

    it("returns the same root for elements in the same set", () => {
      uf.makeSet("a")
      uf.makeSet("b")
      uf.union("a", "b")
      expect(uf.find("a")).toBe(uf.find("b"))
    })

    it("applies path compression", () => {
      uf.makeSet("a")
      uf.makeSet("b")
      uf.makeSet("c")
      uf.union("a", "b")
      uf.union("b", "c")

      const root = uf.find("c")

      // After find, c should point directly to root
      expect(uf.parent.get("c")).toBe(root)
    })
  })

  describe("union", () => {
    it("returns true when merging different sets", () => {
      uf.makeSet("a")
      uf.makeSet("b")
      expect(uf.union("a", "b")).toBe(true)
    })

    it("returns false when elements are already in same set", () => {
      uf.makeSet("a")
      uf.makeSet("b")
      uf.union("a", "b")
      expect(uf.union("a", "b")).toBe(false)
    })

    it("correctly merges multiple sets", () => {
      uf.makeSet("a")
      uf.makeSet("b")
      uf.makeSet("c")
      uf.makeSet("d")

      uf.union("a", "b")
      uf.union("c", "d")

      expect(uf.find("a")).toBe(uf.find("b"))
      expect(uf.find("c")).toBe(uf.find("d"))
      expect(uf.find("a")).not.toBe(uf.find("c"))

      uf.union("b", "c")
      expect(uf.find("a")).toBe(uf.find("d"))
    })

    it("uses union by rank to keep tree balanced", () => {
      // Create a larger set on one side
      uf.makeSet("a")
      uf.makeSet("b")
      uf.makeSet("c")
      uf.union("a", "b")
      uf.union("a", "c")

      uf.makeSet("x")

      // When unioning with single element, larger tree should be root
      uf.union("x", "a")
      expect(uf.find("x")).toBe(uf.find("a"))
    })
  })

  describe("practical usage - connected components", () => {
    it("tracks connected components correctly", () => {
      // Simulate edges: (1,2), (3,4), (2,3) connecting all
      const nodes = [1, 2, 3, 4]

      nodes.forEach((n) => uf.makeSet(n))

      uf.union(1, 2)
      uf.union(3, 4)

      // Two components
      expect(uf.find(1)).toBe(uf.find(2))
      expect(uf.find(3)).toBe(uf.find(4))
      expect(uf.find(1)).not.toBe(uf.find(3))

      // Connect them
      uf.union(2, 3)

      // Now one component
      expect(uf.find(1)).toBe(uf.find(4))
    })
  })
})
