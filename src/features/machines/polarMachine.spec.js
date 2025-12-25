import PolarMachine from "./PolarMachine"
import Victor from "victor"

describe("polar machine", () => {
  let machine

  beforeEach(() => {
    machine = new PolarMachine([], { maxRadius: 250 })
  })

  describe("getPerimeterPosition", () => {
    it("returns 0 at angle 0 (right side)", () => {
      const pos = machine.getPerimeterPosition({ x: 250, y: 0 })
      expect(pos).toBeCloseTo(0, 5)
    })

    it("returns π/2 at top", () => {
      const pos = machine.getPerimeterPosition({ x: 0, y: 250 })
      expect(pos).toBeCloseTo(Math.PI / 2, 5)
    })

    it("returns π at left side", () => {
      const pos = machine.getPerimeterPosition({ x: -250, y: 0 })
      expect(pos).toBeCloseTo(Math.PI, 5)
    })

    it("returns 3π/2 at bottom", () => {
      const pos = machine.getPerimeterPosition({ x: 0, y: -250 })
      expect(pos).toBeCloseTo((3 * Math.PI) / 2, 5)
    })

    it("returns correct perimeter length", () => {
      expect(machine.getPerimeterLength()).toBeCloseTo(2 * Math.PI, 5)
    })
  })

  describe("minimizePerimeterMoves", () => {
    it("returns segments in optimal angular order", () => {
      // Create segments at known angles
      const seg1 = [new Victor(250, 0), new Victor(240, 50)] // ~0 rad
      const seg2 = [new Victor(0, 250), new Victor(50, 240)] // ~π/2 rad
      const seg3 = [new Victor(-250, 0), new Victor(-240, 50)] // ~π rad

      const result = machine.minimizePerimeterMoves([seg1, seg2, seg3])

      expect(result.length).toBe(3)
      expect(result[0]).toEqual(seg1)
      expect(result[1]).toEqual(seg2)
      expect(result[2]).toEqual(seg3)
    })

    it("handles many segments efficiently", () => {
      // Create 100 segments around the perimeter
      const segments = []
      for (let i = 0; i < 100; i++) {
        const angle = (i / 100) * 2 * Math.PI
        const r = 250
        segments.push([
          new Victor(Math.cos(angle) * r, Math.sin(angle) * r),
          new Victor(Math.cos(angle + 0.01) * r, Math.sin(angle + 0.01) * r),
        ])
      }

      const start = performance.now()
      const result = machine.minimizePerimeterMoves(segments)
      const elapsed = performance.now() - start

      expect(result.length).toBe(100)
      expect(elapsed).toBeLessThan(50)
    })
  })
})
