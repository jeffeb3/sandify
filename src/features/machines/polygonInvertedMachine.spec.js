import PolygonInvertedMachine from "./PolygonInvertedMachine"
import Victor from "victor"
import { createStar, createRect, createSquare } from "@/common/testHelpers"
import { circle } from "@/common/geometry"

describe("PolygonInvertedMachine", () => {
  describe("basic clipping - square mask", () => {
    let machine

    beforeEach(() => {
      const mask = createSquare(100)

      machine = new PolygonInvertedMachine({ minimizeMoves: false }, mask)
    })

    it("returns empty when shape is entirely inside mask", () => {
      const smallSquare = createSquare(40)
      const result = machine.polish([...smallSquare])

      expect(result.length).toBe(0)
    })

    it("returns full shape when entirely outside mask", () => {
      const farSquare = createSquare(20, { x: 210, y: 210 })
      const result = machine.polish([...farSquare])

      expect(result.length).toBeGreaterThan(0)

      result.forEach((v) => {
        const inside = Math.abs(v.x) < 50 && Math.abs(v.y) < 50

        expect(inside).toBe(false)
      })
    })

    it("clips shape that crosses mask - keeps outside portion", () => {
      const largeCircle = circle(80, 0, 0, 0, 32) // radius 80, centered at origin
      const result = machine.polish([...largeCircle])

      expect(result.length).toBeGreaterThan(0)
      result.forEach((v) => {
        const strictlyInside = Math.abs(v.x) < 49 && Math.abs(v.y) < 49

        expect(strictlyInside).toBe(false)
      })
    })
  })

  describe("with star mask", () => {
    let machine

    beforeEach(() => {
      const starMask = createStar()

      machine = new PolygonInvertedMachine({ minimizeMoves: false }, starMask)
    })

    it("cuts star-shaped hole in larger circle", () => {
      const largeCircle = circle(60, 0, 0, 0, 32)
      const result = machine.polish([...largeCircle])

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
      const line = [new Victor(-80, 0), new Victor(80, 0)]
      const result = machine.polish([...line])

      expect(result.length).toBeGreaterThan(0)

      const hasLeft = result.some((v) => v.x <= -49)
      const hasRight = result.some((v) => v.x >= 49)

      expect(hasLeft).toBe(true)
      expect(hasRight).toBe(true)
    })
  })

  describe("multiple disconnected regions", () => {
    it("connects multiple regions when mask splits shape", () => {
      // Wide rectangle that spans across a narrow vertical mask
      // Creates two separate pieces on left and right sides
      const narrowMask = createRect(20, 200)
      const machine = new PolygonInvertedMachine(
        { minimizeMoves: false },
        narrowMask,
      )
      const wideRect = createRect(160, 60)
      const result = machine.polish([...wideRect])

      expect(result.length).toBeGreaterThan(0)

      const hasLeft = result.some((v) => v.x <= -10)
      const hasRight = result.some((v) => v.x >= 10)

      expect(hasLeft).toBe(true)
      expect(hasRight).toBe(true)
    })
  })
})
