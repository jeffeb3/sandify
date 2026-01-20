import { eulerizeEdges } from "./chinesePostman"

describe("chinesePostman", () => {
  describe("eulerizeEdges", () => {
    // Helper to create a simple dijkstra function for testing
    // For simple graphs, path is just [start, end]
    const simpleDijkstra = (start, end) => {
      return [{ toString: () => start }, { toString: () => end }]
    }

    it("returns original edges when graph is already Eulerian (all even degree)", () => {
      // Square: A-B-C-D-A (all vertices have degree 2)
      const edges = [
        ["A", "B"],
        ["B", "C"],
        ["C", "D"],
        ["D", "A"],
      ]

      const result = eulerizeEdges(edges, simpleDijkstra)

      expect(result.oddVertices).toHaveLength(0)
      expect(result.edges).toEqual(edges)
      expect(result.duplicateCount).toBe(0)
    })

    it("adds duplicate edges to make odd-degree vertices even", () => {
      // Simple path: A-B-C (A and C have odd degree 1)
      const edges = [
        ["A", "B"],
        ["B", "C"],
      ]

      const result = eulerizeEdges(edges, simpleDijkstra)

      expect(result.oddVertices).toHaveLength(2)
      expect(result.oddVertices).toContain("A")
      expect(result.oddVertices).toContain("C")
      expect(result.edges.length).toBeGreaterThan(edges.length)
      expect(result.duplicateCount).toBeGreaterThan(0)
    })

    it("handles a graph with 4 odd vertices", () => {
      // H shape: two vertical bars connected by horizontal
      // A-B (left bar), C-D (right bar), B-C (connector)
      // Odd vertices: A, D (degree 1), B, C (degree 2 - even)
      // Actually: A=1, B=2, C=2, D=1 -> A and D are odd
      const edges = [
        ["A", "B"],
        ["B", "C"],
        ["C", "D"],
      ]

      const result = eulerizeEdges(edges, simpleDijkstra)

      expect(result.oddVertices).toHaveLength(2)
      expect(result.duplicateCount).toBeGreaterThan(0)
    })

    it("handles single edge graph", () => {
      const edges = [["A", "B"]]

      const result = eulerizeEdges(edges, simpleDijkstra)

      expect(result.oddVertices).toHaveLength(2)
      expect(result.oddVertices).toContain("A")
      expect(result.oddVertices).toContain("B")
    })

    it("handles empty edge list", () => {
      const result = eulerizeEdges([], simpleDijkstra)

      expect(result.oddVertices).toHaveLength(0)
      expect(result.edges).toEqual([])
      expect(result.duplicateCount).toBe(0)
    })

    it("returns matching information", () => {
      const edges = [
        ["A", "B"],
        ["B", "C"],
      ]

      const result = eulerizeEdges(edges, simpleDijkstra)

      expect(result).toHaveProperty("edges")
      expect(result).toHaveProperty("oddVertices")
      expect(result).toHaveProperty("matching")
      expect(result).toHaveProperty("duplicateCount")
    })

    it("works with complex dijkstra paths", () => {
      // Star graph: center B connected to A, C, D, E (B has degree 4, others have degree 1)
      const edges = [
        ["A", "B"],
        ["B", "C"],
        ["B", "D"],
        ["B", "E"],
      ]

      // Dijkstra that returns path through B for any pair
      const starDijkstra = (start, end) => {
        if (start === end) return [{ toString: () => start }]
        if (start === "B" || end === "B") {
          return [{ toString: () => start }, { toString: () => end }]
        }
        return [
          { toString: () => start },
          { toString: () => "B" },
          { toString: () => end },
        ]
      }

      const result = eulerizeEdges(edges, starDijkstra)

      // A, C, D, E all have odd degree (1)
      expect(result.oddVertices).toHaveLength(4)

      // Should pair them up and add duplicate paths
      expect(result.matching).toHaveLength(2)
    })
  })
})
