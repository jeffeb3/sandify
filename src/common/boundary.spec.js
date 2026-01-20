import Victor from "victor"
import { traceBoundary, boundaryAlgorithm } from "./boundary"
import {
  createSquare,
  createStar as createStarBase,
  createFigure8,
  createOpenPath,
  getShapeVertices,
} from "./testHelpers"
import fancyTextSan from "./__fixtures__/fancyTextSan"

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
    // Helper to create a rectangle (non-square)
    const createRectangle = (width, height, center = { x: 0, y: 0 }) => {
      const hw = width / 2
      const hh = height / 2
      return [
        new Victor(center.x - hw, center.y - hh),
        new Victor(center.x + hw, center.y - hh),
        new Victor(center.x + hw, center.y + hh),
        new Victor(center.x - hw, center.y + hh),
        new Victor(center.x - hw, center.y - hh), // close
      ]
    }

    it("traces boundary of a tall rectangle with padding (centered)", () => {
      // Test rectangle centered at origin
      const rect = createRectangle(100, 200)

      const inputBounds = rect.reduce(
        (acc, v) => ({
          minX: Math.min(acc.minX, v.x),
          maxX: Math.max(acc.maxX, v.x),
          minY: Math.min(acc.minY, v.y),
          maxY: Math.max(acc.maxY, v.y),
        }),
        { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity },
      )
      const inputCenterX = (inputBounds.minX + inputBounds.maxX) / 2
      const inputCenterY = (inputBounds.minY + inputBounds.maxY) / 2

      const result = traceBoundary(rect, 10)

      const resultBounds = result.reduce(
        (acc, v) => ({
          minX: Math.min(acc.minX, v.x),
          maxX: Math.max(acc.maxX, v.x),
          minY: Math.min(acc.minY, v.y),
          maxY: Math.max(acc.maxY, v.y),
        }),
        { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity },
      )
      const resultCenterX = (resultBounds.minX + resultBounds.maxX) / 2
      const resultCenterY = (resultBounds.minY + resultBounds.maxY) / 2

      // Center should remain the same
      expect(Math.abs(resultCenterX - inputCenterX)).toBeLessThan(1)
      expect(Math.abs(resultCenterY - inputCenterY)).toBeLessThan(1)
    })

    it("traces boundary of a tall rectangle with padding (off-center)", () => {
      // Test rectangle NOT centered at origin
      const rect = createRectangle(100, 200, { x: 150, y: 300 })

      // Input bounds
      const inputBounds = rect.reduce(
        (acc, v) => ({
          minX: Math.min(acc.minX, v.x),
          maxX: Math.max(acc.maxX, v.x),
          minY: Math.min(acc.minY, v.y),
          maxY: Math.max(acc.maxY, v.y),
        }),
        { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity },
      )
      const inputCenterX = (inputBounds.minX + inputBounds.maxX) / 2
      const inputCenterY = (inputBounds.minY + inputBounds.maxY) / 2

      // Trace with scale=10 (uniform edge offset)
      const result = traceBoundary(rect, 10)

      // Result bounds
      const resultBounds = result.reduce(
        (acc, v) => ({
          minX: Math.min(acc.minX, v.x),
          maxX: Math.max(acc.maxX, v.x),
          minY: Math.min(acc.minY, v.y),
          maxY: Math.max(acc.maxY, v.y),
        }),
        { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity },
      )
      const resultCenterX = (resultBounds.minX + resultBounds.maxX) / 2
      const resultCenterY = (resultBounds.minY + resultBounds.maxY) / 2

      // The result center should match the input center (within tolerance)
      expect(Math.abs(resultCenterX - inputCenterX)).toBeLessThan(1)
      expect(Math.abs(resultCenterY - inputCenterY)).toBeLessThan(1)

      // Centroid scaling (expand mode): proportional expansion from center
      // For 100x200 rect with scale=10: scaleFactor = 1.1
      // So width = 100 * 1.1 = 110, height = 200 * 1.1 = 220
      const inputWidth = inputBounds.maxX - inputBounds.minX
      const inputHeight = inputBounds.maxY - inputBounds.minY
      const resultWidth = resultBounds.maxX - resultBounds.minX
      const resultHeight = resultBounds.maxY - resultBounds.minY
      const scaleFactor = 1 + 10 / 100 // scale=10 → 1.1

      expect(resultWidth).toBeCloseTo(inputWidth * scaleFactor, 0)
      expect(resultHeight).toBeCloseTo(inputHeight * scaleFactor, 0)
    })

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

  describe("text-like shapes (multi-path)", () => {
    it("traces boundary of FancyText 'San' correctly", () => {
      const result = traceBoundary(fancyTextSan)

      // Should return a boundary
      expect(result.length).toBeGreaterThan(10)

      // All results should be Victor instances
      result.forEach((v) => {
        expect(v).toBeInstanceOf(Victor)
      })

      // Boundary should encompass the text
      const bounds = result.reduce(
        (acc, v) => ({
          minX: Math.min(acc.minX, v.x),
          maxX: Math.max(acc.maxX, v.x),
          minY: Math.min(acc.minY, v.y),
          maxY: Math.max(acc.maxY, v.y),
        }),
        { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity },
      )

      // Text spans roughly -53 to 53 in x, -64 to 64 in y
      expect(bounds.minX).toBeLessThan(-40)
      expect(bounds.maxX).toBeGreaterThan(40)
      expect(bounds.minY).toBeLessThan(-50)
      expect(bounds.maxY).toBeGreaterThan(50)
    })

    it("uses footprint algorithm for text", () => {
      const result = traceBoundary(fancyTextSan)
      expect(result.sdfApplied).toBe(true)
    })
  })

  describe("algorithm detection", () => {
    // Helper to test algorithm detection on a shape
    const expectAlgorithm = (shapeType, expectedAlgo, overrides = {}) => {
      const vertices = getShapeVertices(shapeType, overrides)
      const result = boundaryAlgorithm(vertices)
      return { result, vertices, expected: expectedAlgo }
    }

    describe("simple shapes should use expand", () => {
      it("star uses expand", () => {
        const { result } = expectAlgorithm("star")
        expect(result.algorithm).toBe("expand")
      })

      it("polygon uses expand", () => {
        const { result } = expectAlgorithm("polygon")
        expect(result.algorithm).toBe("expand")
      })

      it("heart uses expand", () => {
        const { result } = expectAlgorithm("heart")
        expect(result.algorithm).toBe("expand")
      })

      it("circle uses expand", () => {
        const { result } = expectAlgorithm("circle")
        expect(result.algorithm).toBe("expand")
      })

      it("reuleaux uses expand", () => {
        const { result } = expectAlgorithm("reuleaux")
        expect(result.algorithm).toBe("expand")
      })

      it("rose uses expand", () => {
        const { result } = expectAlgorithm("rose")
        expect(result.algorithm).toBe("expand")
      })

      it("epicycloid (clover) uses expand", () => {
        const { result } = expectAlgorithm("epicycloid")
        expect(result.algorithm).toBe("expand")
      })

      it("v1Engineering uses expand", () => {
        const { result } = expectAlgorithm("v1Engineering")
        expect(result.algorithm).toBe("expand")
      })
    })

    describe("complex shapes", () => {
      it("fractalSpirograph uses footprint (too many paths)", () => {
        const { result } = expectAlgorithm("fractalSpirograph")
        expect(result.algorithm).toBe("footprint")
        expect(result.isFillPattern).toBe(false)
      })

      it("lsystem uses footprint (very high ratio)", () => {
        const { result } = expectAlgorithm("lsystem")
        expect(result.algorithm).toBe("footprint")
        expect(result.boundaryPaths).toBe(1)
      })
    })

    describe("fill patterns should use concave", () => {
      it("voronoi uses concave", () => {
        const { result } = expectAlgorithm("voronoi")
        expect(result.algorithm).toBe("concave")
        expect(result.isFillPattern).toBe(true)
      })

      it("tessellationTwist uses concave", () => {
        const { result } = expectAlgorithm("tessellationTwist")
        expect(result.algorithm).toBe("concave")
        expect(result.isFillPattern).toBe(true)
      })
    })

    describe("high-ratio single-path shapes", () => {
      // These shapes have complex geometry (high ratio) and are single-path closed shapes
      // Maze uses footprint due to very high ratio (>40) after Eulerian trail refactor

      it("maze uses footprint (very high ratio)", () => {
        const { result } = expectAlgorithm("maze", {
          mazeWidth: 8,
          mazeHeight: 8,
        })
        expect(result.algorithm).toBe("footprint")
        expect(result.boundaryPaths).toBe(1)
      })

      it("hypocycloid (web-like) uses expand", () => {
        const { result } = expectAlgorithm("hypocycloid")
        expect(result.algorithm).toBe("expand")
        expect(result.boundaryPaths).toBe(1)
      })
    })
  })
})
