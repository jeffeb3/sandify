import PolygonInvertedMachine from "./PolygonInvertedMachine"
import Victor from "victor"
import { createStar, createRect } from "@/common/testHelpers"
import { circle } from "@/common/geometry"

describe("PolygonInvertedMachine", () => {
  describe("basic clipping - square mask", () => {
    let machine

    beforeEach(() => {
      const mask = createRect(100, 100)  // 100x100 square mask
      machine = new PolygonInvertedMachine({ minimizeMoves: false }, mask)
    })

    it("returns empty when shape is entirely inside mask", () => {
      // Small square entirely inside the 100x100 mask
      const smallSquare = [
        new Victor(-20, -20),
        new Victor(20, -20),
        new Victor(20, 20),
        new Victor(-20, 20),
        new Victor(-20, -20),
      ]

      const result = machine.polish([...smallSquare])

      expect(result.length).toBe(0)
    })

    it("returns full shape when entirely outside mask", () => {
      // Square far outside the mask
      const farSquare = [
        new Victor(200, 200),
        new Victor(220, 200),
        new Victor(220, 220),
        new Victor(200, 220),
        new Victor(200, 200),
      ]

      const result = machine.polish([...farSquare])

      // Should have vertices (shape preserved)
      expect(result.length).toBeGreaterThan(0)
      // All vertices should be outside the mask
      result.forEach(v => {
        const inside = Math.abs(v.x) < 50 && Math.abs(v.y) < 50
        expect(inside).toBe(false)
      })
    })

    it("clips shape that crosses mask - keeps outside portion", () => {
      // Large circle that extends beyond the mask
      const largeCircle = circle(80, 0, 0, 0, 32)  // radius 80, centered at origin

      const result = machine.polish([...largeCircle])

      // Should have vertices
      expect(result.length).toBeGreaterThan(0)
      // All result vertices should be outside or on the mask boundary
      result.forEach(v => {
        const strictlyInside = Math.abs(v.x) < 49 && Math.abs(v.y) < 49
        expect(strictlyInside).toBe(false)
      })
    })
  })

  describe("with star mask", () => {
    let machine

    beforeEach(() => {
      const starMask = createStar()  // Default 5-pointed star
      machine = new PolygonInvertedMachine({ minimizeMoves: false }, starMask)
    })

    it("cuts star-shaped hole in larger circle", () => {
      // Circle larger than the star
      const largeCircle = circle(60, 0, 0, 0, 32)

      const result = machine.polish([...largeCircle])

      // Should have vertices (the ring between circle and star)
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe("open paths", () => {
    let machine

    beforeEach(() => {
      const mask = createRect(100, 100)
      machine = new PolygonInvertedMachine({ minimizeMoves: false }, mask)
    })

    it("clips line that passes through mask", () => {
      // Horizontal line from left to right, passing through mask
      const line = [
        new Victor(-80, 0),
        new Victor(80, 0),
      ]

      const result = machine.polish([...line])

      // Should have vertices on both sides of the mask
      expect(result.length).toBeGreaterThan(0)
      // Should have points at x < -50 and x > 50
      const hasLeft = result.some(v => v.x <= -49)
      const hasRight = result.some(v => v.x >= 49)
      expect(hasLeft).toBe(true)
      expect(hasRight).toBe(true)
    })
  })

  describe("multiple disconnected regions", () => {
    it("connects multiple regions when mask splits shape", () => {
      // Wide rectangle that spans across a narrow vertical mask
      // Creates two separate pieces on left and right sides
      const narrowMask = createRect(20, 200)
      const machine = new PolygonInvertedMachine({ minimizeMoves: false }, narrowMask)

      // Wide rectangle crossing the mask
      const wideRect = createRect(160, 60)

      const result = machine.polish([...wideRect])

      // Should have vertices (two regions connected)
      expect(result.length).toBeGreaterThan(0)
      // Should have points on both sides of the mask
      const hasLeft = result.some(v => v.x <= -10)
      const hasRight = result.some(v => v.x >= 10)
      expect(hasLeft).toBe(true)
      expect(hasRight).toBe(true)
    })
  })
})
