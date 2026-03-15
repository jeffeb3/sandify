import FlowTile from "./FlowTile"
import { tileRenderers } from "./tileRenderers"
import { tileBounds, getEdgePoints, getEdgeMidpoints } from "./geometry"

describe("FlowTile", () => {
  let shape

  beforeEach(() => {
    shape = new FlowTile()
  })

  describe("drawOuterBorder", () => {
    it("creates segments for tile perimeter", () => {
      const segments = shape.drawOuterBorder(3, 3)

      // Each edge has 2 segments per tile (split at midpoint)
      // 3 tiles per edge * 2 segments * 4 edges = 24 segments
      expect(segments.length).toBe(24)
    })

    it("segments connect at tile midpoints", () => {
      const segments = shape.drawOuterBorder(2, 2)
      const topSegments = segments.slice(0, 4) // First 4 are top edge

      // Check midpoint connections
      expect(topSegments[0][1].x).toBe(topSegments[1][0].x)
      expect(topSegments[0][1].y).toBe(topSegments[1][0].y)
    })
  })
})

describe("tileRenderers", () => {
  const bounds = tileBounds(0, 0, 2)

  describe("Arc", () => {
    it("produces 2 arc paths without stroke", () => {
      const paths = tileRenderers.Arc(bounds, 0, 0, false)

      expect(paths.length).toBe(2)
    })

    it("produces 4 paths with stroke (inner/outer for each arc)", () => {
      const paths = tileRenderers.Arc(bounds, 0, 0.25, false)

      expect(paths.length).toBe(4)
    })

    it("produces 6 paths with border (2 arcs + 4 border segments)", () => {
      const paths = tileRenderers.Arc(bounds, 0, 0, true)

      expect(paths.length).toBe(6)
    })

    it("produces different paths for different orientations", () => {
      const paths0 = tileRenderers.Arc(bounds, 0, 0, false)
      const paths1 = tileRenderers.Arc(bounds, 1, 0, false)

      // Arc endpoints should differ between orientations
      const start0 = paths0[0][0]
      const start1 = paths1[0][0]

      expect(start0.x === start1.x && start0.y === start1.y).toBe(false)
    })
  })

  describe("Diagonal", () => {
    it("produces 2 line paths without stroke", () => {
      const paths = tileRenderers.Diagonal(bounds, 0, 0, false)

      expect(paths.length).toBe(2)
    })

    it("produces 4 paths with stroke", () => {
      const paths = tileRenderers.Diagonal(bounds, 0, 0.3, false)

      expect(paths.length).toBe(4)
    })

    it("produces 6 paths with border", () => {
      const paths = tileRenderers.Diagonal(bounds, 0, 0, true)

      expect(paths.length).toBe(6)
    })

    it("line paths have 2 points each", () => {
      const paths = tileRenderers.Diagonal(bounds, 0, 0, false)

      expect(paths[0].length).toBe(2)
      expect(paths[1].length).toBe(2)
    })
  })
})

describe("geometry", () => {
  describe("tileBounds", () => {
    it("computes bounds centered on given point", () => {
      const bounds = tileBounds(4, 6, 2)

      expect(bounds.cx).toBe(4)
      expect(bounds.cy).toBe(6)
      expect(bounds.left).toBe(3)
      expect(bounds.right).toBe(5)
      expect(bounds.top).toBe(5)
      expect(bounds.bottom).toBe(7)
    })

    it("defaults to size 2", () => {
      const bounds = tileBounds(0, 0)

      expect(bounds.size).toBe(2)
      expect(bounds.right - bounds.left).toBe(2)
    })
  })

  describe("getEdgePoints", () => {
    it("returns midpoints for fraction 0.5", () => {
      const bounds = tileBounds(0, 0, 2)
      const points = getEdgePoints(bounds, [0.5])

      expect(points.left[0].x).toBe(-1)
      expect(points.left[0].y).toBe(0)
      expect(points.right[0].x).toBe(1)
      expect(points.right[0].y).toBe(0)
      expect(points.top[0].x).toBe(0)
      expect(points.top[0].y).toBe(-1)
      expect(points.bottom[0].x).toBe(0)
      expect(points.bottom[0].y).toBe(1)
    })

    it("returns multiple points for multiple fractions", () => {
      const bounds = tileBounds(0, 0, 3)
      const points = getEdgePoints(bounds, [1 / 3, 2 / 3])

      expect(points.left.length).toBe(2)
      expect(points.top.length).toBe(2)
    })
  })

  describe("getEdgeMidpoints", () => {
    it("returns named midpoint properties", () => {
      const bounds = tileBounds(0, 0, 2)
      const { midLeft, midRight, midTop, midBottom } = getEdgeMidpoints(bounds)

      expect(midLeft.x).toBe(-1)
      expect(midLeft.y).toBe(0)
      expect(midRight.x).toBe(1)
      expect(midRight.y).toBe(0)
      expect(midTop.x).toBe(0)
      expect(midTop.y).toBe(-1)
      expect(midBottom.x).toBe(0)
      expect(midBottom.y).toBe(1)
    })
  })
})
