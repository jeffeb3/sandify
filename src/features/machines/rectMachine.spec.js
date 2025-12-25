import RectMachine from "./RectMachine"
import Victor from "victor"

describe("rect machine", () => {
  let machine

  beforeEach(() => {
    machine = new RectMachine([], { minX: 0, maxX: 500, minY: 0, maxY: 500 })
  })

  describe("onPerimeter", () => {
    it("when points on minX, returns true", () => {
      const p1 = { x: -250, y: 0 }
      const p2 = { x: -250, y: 50 }
      expect(machine.onPerimeter(p1, p2)).toEqual(true)
    })

    it("when points on different X, returns false", () => {
      const p1 = { x: 250, y: 0 }
      const p2 = { x: -250, y: 50 }
      expect(machine.onPerimeter(p1, p2)).toEqual(false)
    })

    it("when points on different X (same Y), returns false", () => {
      const p1 = { x: 250, y: 50 }
      const p2 = { x: -250, y: 50 }
      expect(machine.onPerimeter(p1, p2)).toEqual(false)
    })

    it("when points on minY, returns true", () => {
      const p1 = { x: 0, y: -250 }
      const p2 = { x: 50, y: -250 }
      expect(machine.onPerimeter(p1, p2)).toEqual(true)
    })

    it("when points on different Y, returns false", () => {
      const p1 = { x: 0, y: 250 }
      const p2 = { x: 50, y: -250 }
      expect(machine.onPerimeter(p1, p2)).toEqual(false)
    })

    it("when points on different Y (same X), returns false", () => {
      const p1 = { x: 50, y: -250 }
      const p2 = { x: 50, y: 250 }
      expect(machine.onPerimeter(p1, p2)).toEqual(false)
    })
  })

  describe("tracePerimeter", () => {
    it("when points on the same line, no connecting points needed", () => {
      const p1 = { x: 50, y: -250 }
      const p2 = { x: 100, y: -250 }
      expect(machine.tracePerimeter(p1, p2)).toEqual([])
    })

    it("when points have different orientations, gives a single connecting corner", () => {
      expect(
        machine.tracePerimeter({ x: 50, y: -250 }, { x: 250, y: -50 }),
      ).toEqual([{ x: 250, y: -250 }])
      expect(
        machine.tracePerimeter({ x: -50, y: -250 }, { x: 250, y: -50 }),
      ).toEqual([{ x: 250, y: -250 }])
    })

    it("when points have the same orientations on different lines, gives two connecting corners", () => {
      expect(
        machine.tracePerimeter({ x: -50, y: -250 }, { x: -50, y: 250 }),
      ).toEqual([
        { x: -250, y: -250 },
        { x: -250, y: 250 },
      ])
      expect(
        machine.tracePerimeter({ x: 100, y: -250 }, { x: 100, y: 250 }),
      ).toEqual([
        { x: 250, y: -250 },
        { x: 250, y: 250 },
      ])
      expect(
        machine.tracePerimeter({ x: 100, y: 250 }, { x: 100, y: -250 }),
      ).toEqual([
        { x: 250, y: 250 },
        { x: 250, y: -250 },
      ])

      expect(
        machine.tracePerimeter({ x: -250, y: 50 }, { x: 250, y: 50 }),
      ).toEqual([
        { x: -250, y: 250 },
        { x: 250, y: 250 },
      ])
      expect(
        machine.tracePerimeter({ x: -250, y: -50 }, { x: 250, y: -50 }),
      ).toEqual([
        { x: -250, y: -250 },
        { x: 250, y: -250 },
      ])
      expect(
        machine.tracePerimeter({ x: 250, y: -50 }, { x: -250, y: -50 }),
      ).toEqual([
        { x: 250, y: -250 },
        { x: -250, y: -250 },
      ])
    })
  })

  describe("clipSegment", () => {
    it("handles line outside box that misses all edges (no infinite recursion)", () => {
      // Line from (-300, 240) to (-240, 300) goes around top-left corner
      // Both points outside, different quadrants, AND=0, but no intersection
      // This exercises the fallback case in clipSegment
      const start = new Victor(-300, 240)
      const end = new Victor(-240, 300)

      const result = machine.clipSegment(start, end)

      // Should return nearest vertices clamped to perimeter
      expect(result.length).toBeGreaterThanOrEqual(1)
      result.forEach((v) => {
        expect(v.x).toBeGreaterThanOrEqual(-250)
        expect(v.x).toBeLessThanOrEqual(250)
        expect(v.y).toBeGreaterThanOrEqual(-250)
        expect(v.y).toBeLessThanOrEqual(250)
      })
    })

    it("returns both points when line is inside box", () => {
      const start = new Victor(0, 0)
      const end = new Victor(100, 100)

      const result = machine.clipSegment(start, end)

      expect(result).toEqual([start, end])
    })

    it("clips line that crosses box boundary", () => {
      const start = new Victor(0, 0)
      const end = new Victor(300, 0)

      const result = machine.clipSegment(start, end)

      expect(result.length).toBe(3)
      expect(result[0]).toEqual(start)
      expect(result[1].x).toBe(250) // clipped at right edge
    })
  })

  describe("nearestPerimeterVertex", () => {
    it("finds the nearest vertex", () => {
      expect(machine.nearestPerimeterVertex({ x: 10, y: 100 })).toEqual(
        new Victor(10, 250),
      )
      expect(machine.nearestPerimeterVertex({ x: 100, y: 10 })).toEqual(
        new Victor(250, 10),
      )
      expect(machine.nearestPerimeterVertex({ x: -10, y: -100 })).toEqual(
        new Victor(-10, -250),
      )
      expect(machine.nearestPerimeterVertex({ x: -100, y: -10 })).toEqual(
        new Victor(-250, -10),
      )
    })
  })

  describe("getPerimeterPosition", () => {
    it("returns 0 at bottom-left corner", () => {
      expect(machine.getPerimeterPosition({ x: -250, y: -250 })).toBe(0)
    })

    it("increases along bottom edge", () => {
      expect(machine.getPerimeterPosition({ x: 0, y: -250 })).toBe(250)
      expect(machine.getPerimeterPosition({ x: 250, y: -250 })).toBe(500)
    })

    it("continues along right edge", () => {
      expect(machine.getPerimeterPosition({ x: 250, y: 0 })).toBe(750)
      expect(machine.getPerimeterPosition({ x: 250, y: 250 })).toBe(1000)
    })

    it("continues along top edge", () => {
      expect(machine.getPerimeterPosition({ x: 0, y: 250 })).toBe(1250)
      expect(machine.getPerimeterPosition({ x: -250, y: 250 })).toBe(1500)
    })

    it("continues along left edge back to start", () => {
      expect(machine.getPerimeterPosition({ x: -250, y: 0 })).toBe(1750)
    })

    it("returns correct perimeter length", () => {
      expect(machine.getPerimeterLength()).toBe(2000) // 4 * 250 + 4 * 250
    })
  })

  describe("minimizePerimeterMoves", () => {
    it("returns segments in optimal order", () => {
      // Create segments at known positions around the perimeter
      const seg1 = [new Victor(-200, -250), new Victor(-100, -250)] // bottom edge, left
      const seg2 = [new Victor(100, -250), new Victor(200, -250)] // bottom edge, right
      const seg3 = [new Victor(250, 100), new Victor(250, 200)] // right edge

      const result = machine.minimizePerimeterMoves([seg1, seg2, seg3])

      // Starting from seg1, nearest should be seg2, then seg3
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
        const x1 = Math.cos(angle) * 200
        const y1 = Math.sin(angle) * 200
        const x2 = Math.cos(angle + 0.01) * 200
        const y2 = Math.sin(angle + 0.01) * 200
        segments.push([
          machine.nearestPerimeterVertex(new Victor(x1, y1)),
          machine.nearestPerimeterVertex(new Victor(x2, y2)),
        ])
      }

      const start = performance.now()
      const result = machine.minimizePerimeterMoves(segments)
      const elapsed = performance.now() - start

      expect(result.length).toBe(100)
      // Should complete in under 50ms for 100 segments
      expect(elapsed).toBeLessThan(50)
    })
  })
})
