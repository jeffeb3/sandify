import Graph, { edgeKey, buildGraph, getEulerianTrail } from "./Graph"

describe("Graph", () => {
  let graph

  beforeEach(() => {
    graph = new Graph()
  })

  describe("addNode", () => {
    it("adds a node to the graph", () => {
      const node = { x: 1, y: 2, toString: () => "1,2" }
      graph.addNode(node)

      expect(graph.nodeKeys.has("1,2")).toBe(true)
      expect(graph.nodeMap["1,2"]).toBe(node)
    })

    it("does not add duplicate nodes", () => {
      const node1 = { x: 1, y: 2, toString: () => "1,2" }
      const node2 = { x: 1, y: 2, toString: () => "1,2" }

      graph.addNode(node1)
      graph.addNode(node2)

      expect(graph.nodeKeys.size).toBe(1)
      expect(graph.nodeMap["1,2"]).toBe(node1)
    })
  })

  describe("addEdge", () => {
    it("adds an edge between two nodes", () => {
      const n1 = { toString: () => "A" }
      const n2 = { toString: () => "B" }

      graph.addNode(n1)
      graph.addNode(n2)
      graph.addEdge(n1, n2)

      expect(graph.edgeKeys.has("A,B")).toBe(true)
      expect(graph.adjacencyList["A"]).toHaveLength(1)
      expect(graph.adjacencyList["B"]).toHaveLength(1)
    })

    it("does not add duplicate edges", () => {
      const n1 = { toString: () => "A" }
      const n2 = { toString: () => "B" }

      graph.addNode(n1)
      graph.addNode(n2)
      graph.addEdge(n1, n2)
      graph.addEdge(n1, n2)
      graph.addEdge(n2, n1)

      expect(graph.edgeKeys.size).toBe(1)
    })
  })

  describe("neighbors", () => {
    it("returns neighbors of a node", () => {
      const n1 = { toString: () => "A" }
      const n2 = { toString: () => "B" }
      const n3 = { toString: () => "C" }

      graph.addNode(n1)
      graph.addNode(n2)
      graph.addNode(n3)
      graph.addEdge(n1, n2)
      graph.addEdge(n1, n3)

      const neighbors = graph.neighbors(n1)

      expect(neighbors).toHaveLength(2)
    })
  })

  describe("dijkstraShortestPath", () => {
    it("finds shortest path between two nodes", () => {
      const a = { toString: () => "A" }
      const b = { toString: () => "B" }
      const c = { toString: () => "C" }

      graph.addNode(a)
      graph.addNode(b)
      graph.addNode(c)
      graph.addEdge(a, b)
      graph.addEdge(b, c)

      const path = graph.dijkstraShortestPath("A", "C")

      expect(path).toHaveLength(3)
      expect(path[0].toString()).toBe("A")
      expect(path[1].toString()).toBe("B")
      expect(path[2].toString()).toBe("C")
    })

    it("caches paths for performance", () => {
      const a = { toString: () => "A" }
      const b = { toString: () => "B" }

      graph.addNode(a)
      graph.addNode(b)
      graph.addEdge(a, b)

      const path1 = graph.dijkstraShortestPath("A", "B")
      const path2 = graph.dijkstraShortestPath("A", "B")

      expect(path1).toEqual(path2)
      expect(path1).not.toBe(path2) // Should be a copy
    })
  })

  describe("findComponents", () => {
    it("finds single component in connected graph", () => {
      const a = { toString: () => "A" }
      const b = { toString: () => "B" }
      const c = { toString: () => "C" }

      graph.addNode(a)
      graph.addNode(b)
      graph.addNode(c)
      graph.addEdge(a, b)
      graph.addEdge(b, c)

      const components = graph.findComponents()

      expect(components).toHaveLength(1)
      expect(components[0]).toHaveLength(3)
    })

    it("finds multiple components in disconnected graph", () => {
      const a = { toString: () => "A" }
      const b = { toString: () => "B" }
      const c = { toString: () => "C" }
      const d = { toString: () => "D" }

      graph.addNode(a)
      graph.addNode(b)
      graph.addNode(c)
      graph.addNode(d)
      graph.addEdge(a, b)
      graph.addEdge(c, d)

      const components = graph.findComponents()

      expect(components).toHaveLength(2)
    })
  })

  describe("connectComponents", () => {
    it("does nothing for already connected graph", () => {
      const a = { x: 0, y: 0, toString: () => "A" }
      const b = { x: 1, y: 0, toString: () => "B" }

      graph.addNode(a)
      graph.addNode(b)
      graph.addEdge(a, b)

      const edgeCountBefore = graph.edgeKeys.size
      graph.connectComponents()
      const edgeCountAfter = graph.edgeKeys.size

      expect(edgeCountAfter).toBe(edgeCountBefore)
    })

    it("adds bridge edges to connect components", () => {
      const a = { x: 0, y: 0, toString: () => "A" }
      const b = { x: 1, y: 0, toString: () => "B" }
      const c = { x: 10, y: 0, toString: () => "C" }
      const d = { x: 11, y: 0, toString: () => "D" }

      graph.addNode(a)
      graph.addNode(b)
      graph.addNode(c)
      graph.addNode(d)
      graph.addEdge(a, b)
      graph.addEdge(c, d)

      expect(graph.findComponents()).toHaveLength(2)

      graph.connectComponents()

      expect(graph.findComponents()).toHaveLength(1)
    })

    it("uses shortest bridges (MST-like)", () => {
      // Two components, should connect via nearest points
      const a = { x: 0, y: 0, toString: () => "A" }
      const b = { x: 1, y: 0, toString: () => "B" }
      const c = { x: 2, y: 0, toString: () => "C" } // Closest to B
      const d = { x: 100, y: 0, toString: () => "D" }

      graph.addNode(a)
      graph.addNode(b)
      graph.addNode(c)
      graph.addNode(d)
      graph.addEdge(a, b)
      graph.addEdge(c, d)

      graph.connectComponents()

      // Should have connected B to C (distance 1) not A to D (distance 100)
      expect(graph.hasEdge("B", "C")).toBeTruthy()
    })
  })
})

describe("edgeKey", () => {
  it("returns consistent key regardless of node order", () => {
    const n1 = { toString: () => "A" }
    const n2 = { toString: () => "B" }

    expect(edgeKey(n1, n2)).toBe(edgeKey(n2, n1))
  })
})

describe("buildGraph", () => {
  it("builds a graph from a path of nodes", () => {
    const nodes = [
      { toString: () => "A" },
      { toString: () => "B" },
      { toString: () => "C" },
    ]

    const graph = buildGraph(nodes)

    expect(graph.nodeKeys.size).toBe(3)
    expect(graph.edgeKeys.size).toBe(2)
  })

  it("handles empty node list", () => {
    const graph = buildGraph([])

    expect(graph.nodeKeys.size).toBe(0)
  })

  it("handles single node", () => {
    const graph = buildGraph([{ toString: () => "A" }])

    expect(graph.nodeKeys.size).toBe(1)
    expect(graph.edgeKeys.size).toBe(0)
  })
})

describe("getEulerianTrail", () => {
  it("returns trail covering all edges for Eulerian graph", () => {
    const graph = new Graph()

    // Triangle: all vertices have degree 2 (Eulerian)
    const a = { x: 0, y: 0, toString: () => "A" }
    const b = { x: 1, y: 0, toString: () => "B" }
    const c = { x: 0.5, y: 1, toString: () => "C" }

    graph.addNode(a)
    graph.addNode(b)
    graph.addNode(c)
    graph.addEdge(a, b)
    graph.addEdge(b, c)
    graph.addEdge(c, a)

    const trail = getEulerianTrail(graph)

    // Trail should visit 4 nodes (3 edges + return to start)
    expect(trail).toHaveLength(4)
  })

  it("returns trail for non-Eulerian graph (with duplicates added)", () => {
    const graph = new Graph()

    // Path: A-B-C (A and C have odd degree)
    const a = { x: 0, y: 0, toString: () => "A" }
    const b = { x: 1, y: 0, toString: () => "B" }
    const c = { x: 2, y: 0, toString: () => "C" }

    graph.addNode(a)
    graph.addNode(b)
    graph.addNode(c)
    graph.addEdge(a, b)
    graph.addEdge(b, c)

    const trail = getEulerianTrail(graph)

    // Should have a valid trail (duplicates added to make it Eulerian)
    expect(trail.length).toBeGreaterThanOrEqual(3)
  })

  it("works with disconnected graph after connecting", () => {
    const graph = new Graph()

    const a = { x: 0, y: 0, toString: () => "A" }
    const b = { x: 1, y: 0, toString: () => "B" }
    const c = { x: 10, y: 0, toString: () => "C" }
    const d = { x: 11, y: 0, toString: () => "D" }

    graph.addNode(a)
    graph.addNode(b)
    graph.addNode(c)
    graph.addNode(d)
    graph.addEdge(a, b)
    graph.addEdge(c, d)

    graph.connectComponents()

    const trail = getEulerianTrail(graph)

    // Should cover all nodes
    const visitedNodes = new Set(trail)
    expect(visitedNodes.size).toBeGreaterThanOrEqual(4)
  })
})
