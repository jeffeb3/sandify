import Victor from "victor"
import { traceBoundary } from "./boundary"
import {
  createSquare,
  createStar as createStarBase,
  createFigure8,
  createOpenPath,
  createFillPattern,
} from "./testHelpers"

// Wrap createStar to close the path (boundary tests expect closed paths)
const createStar = (outerRadius = 50, innerRadius = 20) => {
  const vertices = createStarBase(outerRadius, innerRadius)
  vertices.push(vertices[0].clone()) // close
  return vertices
}

describe("traceBoundary", () => {
  describe("edge cases", () => {
    it("returns empty array for empty input", () => {
      const result = traceBoundary([])

      expect(result).toEqual([])
    })

    it("returns copy of input for 1 vertex", () => {
      const input = [new Victor(10, 20)]
      const result = traceBoundary(input)

      expect(result).toHaveLength(1)
      expect(result[0].x).toBe(10)
      expect(result[0].y).toBe(20)
    })

    it("returns copy of input for 2 vertices", () => {
      const input = [new Victor(0, 0), new Victor(10, 10)]
      const result = traceBoundary(input)

      expect(result).toHaveLength(2)
    })
  })

  describe("simple closed shapes", () => {
    it("traces boundary of a square", () => {
      const square = createSquare(100)
      const result = traceBoundary(square)

      // Should return a closed boundary
      expect(result.length).toBeGreaterThanOrEqual(4)

      // All points should be roughly within the square bounds
      result.forEach((v) => {
        expect(v.x).toBeGreaterThanOrEqual(-51)
        expect(v.x).toBeLessThanOrEqual(51)
        expect(v.y).toBeGreaterThanOrEqual(-51)
        expect(v.y).toBeLessThanOrEqual(51)
      })
    })

    it("traces boundary of a star (concave shape)", () => {
      const star = createStar(50, 20)
      const result = traceBoundary(star)

      // Should return a boundary that follows the star's outer edge
      expect(result.length).toBeGreaterThanOrEqual(5)

      // Should include points near the star tips
      const hasOuterPoints = result.some((v) => v.length() > 40)

      expect(hasOuterPoints).toBe(true)
    })
  })

  describe("self-intersecting shapes", () => {
    it("traces boundary of a figure-8", () => {
      const figure8 = createFigure8(30)
      const result = traceBoundary(figure8)

      // Should return a boundary (may use SDF or hull approach)
      expect(result.length).toBeGreaterThanOrEqual(3)

      // Boundary should encompass the figure-8
      const bounds = result.reduce(
        (acc, v) => ({
          minX: Math.min(acc.minX, v.x),
          maxX: Math.max(acc.maxX, v.x),
          minY: Math.min(acc.minY, v.y),
          maxY: Math.max(acc.maxY, v.y),
        }),
        { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity },
      )

      expect(bounds.maxX - bounds.minX).toBeGreaterThan(50) // width
      expect(bounds.maxY - bounds.minY).toBeGreaterThan(25) // height
    })
  })

  describe("open paths", () => {
    it("traces boundary of an open L-shape", () => {
      const lShape = createOpenPath()
      const result = traceBoundary(lShape)

      // Should return a boundary
      expect(result.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe("multi-path shapes", () => {
    it("traces boundary of disconnected squares", () => {
      const grid = createFillPattern(5, 8, 2)
      const result = traceBoundary(grid)

      expect(result.length).toBeGreaterThanOrEqual(3)

      result.forEach((v) => {
        expect(v).toBeInstanceOf(Victor)
      })
    })
  })

  describe("scale parameter", () => {
    it("expands boundary when scale > 0", () => {
      const square = createSquare(100)
      const normal = traceBoundary(square, 0)
      const expanded = traceBoundary(square, 20)

      // Calculate bounding box sizes
      const normalBounds = normal.reduce(
        (acc, v) => ({
          minX: Math.min(acc.minX, v.x),
          maxX: Math.max(acc.maxX, v.x),
        }),
        { minX: Infinity, maxX: -Infinity },
      )
      const expandedBounds = expanded.reduce(
        (acc, v) => ({
          minX: Math.min(acc.minX, v.x),
          maxX: Math.max(acc.maxX, v.x),
        }),
        { minX: Infinity, maxX: -Infinity },
      )

      const normalWidth = normalBounds.maxX - normalBounds.minX
      const expandedWidth = expandedBounds.maxX - expandedBounds.minX

      expect(expandedWidth).toBeGreaterThan(normalWidth)
    })

    it("contracts boundary when scale < 0 (for non-SDF shapes)", () => {
      const square = createSquare(100)
      const normal = traceBoundary(square, 0)
      const contracted = traceBoundary(square, -20)

      const normalBounds = normal.reduce(
        (acc, v) => ({
          minX: Math.min(acc.minX, v.x),
          maxX: Math.max(acc.maxX, v.x),
        }),
        { minX: Infinity, maxX: -Infinity },
      )
      const contractedBounds = contracted.reduce(
        (acc, v) => ({
          minX: Math.min(acc.minX, v.x),
          maxX: Math.max(acc.maxX, v.x),
        }),
        { minX: Infinity, maxX: -Infinity },
      )

      const normalWidth = normalBounds.maxX - normalBounds.minX
      const contractedWidth = contractedBounds.maxX - contractedBounds.minX

      expect(contractedWidth).toBeLessThan(normalWidth)
    })
  })

  describe("returns Victor instances", () => {
    it("returns array of Victor objects", () => {
      const square = createSquare(50)
      const result = traceBoundary(square)

      result.forEach((v) => {
        expect(v).toBeInstanceOf(Victor)
      })
    })
  })
})
