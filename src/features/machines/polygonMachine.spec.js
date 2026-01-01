import PolygonMachine from "./PolygonMachine"
import Victor from "victor"
import { createStar, createTriangle, createBumpyRect, createOpenPath, getShapeVertices } from "@/common/testHelpers"
import { circle, resizeVertices } from "@/common/geometry"
import { traceBoundary } from "@/common/boundary"

// Wrapper for geometry's circle to match test usage (radius, segments, center)
const createCircle = (radius = 30, segments = 32, center = { x: 0, y: 0 }) => {
  return circle(radius, 0, center.x, center.y, segments)
}

describe("PolygonMachine", () => {
  describe("with star boundary", () => {
    let machine
    let starVertices

    beforeEach(() => {
      starVertices = createStar(50, 20)
      machine = new PolygonMachine({ minimizeMoves: false }, starVertices)
    })

    describe("inBounds", () => {
      it("returns true for point at center", () => {
        expect(machine.inBounds({ x: 0, y: 0 })).toBe(true)
      })

      it("returns true for point inside star", () => {
        expect(machine.inBounds({ x: 5, y: 5 })).toBe(true)
      })

      it("returns false for point outside star", () => {
        expect(machine.inBounds({ x: 100, y: 100 })).toBe(false)
      })

      it("returns false for point in star notch", () => {
        // Point in the "notch" between star points - outside the concave region
        expect(machine.inBounds({ x: 30, y: 30 })).toBe(false)
      })
    })

    describe("clipSegment", () => {
      it("returns segment unchanged when both points inside", () => {
        const start = new Victor(0, 0)
        const end = new Victor(10, 10)
        const result = machine.clipSegment(start, end)
        expect(result).toEqual([start, end])
      })

      it("clips segment that exits the star", () => {
        const start = new Victor(0, 0)
        const end = new Victor(100, 0) // exits to the right
        const result = machine.clipSegment(start, end)

        expect(result.length).toBeGreaterThanOrEqual(2)
        expect(result[0]).toEqual(start)
        // Second point should be on the boundary
        expect(result[1].x).toBeGreaterThan(0)
        expect(result[1].x).toBeLessThan(100)
      })

      it("clips segment that enters the star", () => {
        const start = new Victor(100, 0) // outside
        const end = new Victor(0, 0) // inside
        const result = machine.clipSegment(start, end)

        expect(result.length).toBeGreaterThanOrEqual(2)
        // First point should be intersection
        expect(result[0].x).toBeLessThan(100)
        expect(result[result.length - 1]).toEqual(end)
      })

      it("traces perimeter for segment fully outside", () => {
        const start = new Victor(100, 50)
        const end = new Victor(100, -50)
        const result = machine.clipSegment(start, end)

        // Should include perimeter vertices
        expect(result.length).toBeGreaterThan(2)
      })

      it("handles segment through concave notch (both endpoints inside)", () => {
        // Both points are inside the star (in different arms), but a straight
        // line between them passes through a concave notch (outside the star)
        // This tests the fix for concave polygon clipping
        //
        // Points in bottom arm and right arm, line crosses the notch between them
        const start = new Victor(0, -35) // inside bottom arm
        const end = new Victor(30, -12) // inside right arm

        // Verify both points are actually inside the star
        expect(machine.inBounds(start)).toBe(true)
        expect(machine.inBounds(end)).toBe(true)

        // Verify the line actually crosses the boundary (goes through notch)
        const intersections = machine.findIntersections(start, end)
        expect(intersections.length).toBeGreaterThanOrEqual(2)

        const result = machine.clipSegment(start, end)

        // Should have more than 2 points (start, exit, perimeter vertex, entry, end)
        expect(result.length).toBeGreaterThan(2)

        // All result points should be inside or on the boundary
        result.forEach((pt) => {
          const nearest = machine.nearestVertex(pt)
          expect(pt.distance(nearest)).toBeLessThan(1)
        })
      })
    })

    describe("tracePerimeter", () => {
      it("includes star vertices when tracing between distant edges", () => {
        // Get two points on opposite sides of the star
        const p1 = machine.nearestPerimeterVertex({ x: 60, y: 0 })
        const p2 = machine.nearestPerimeterVertex({ x: -60, y: 0 })

        const trace = machine.tracePerimeter(p1, p2, true)

        // Should include multiple star vertices
        expect(trace.length).toBeGreaterThan(2)
      })
    })

    describe("nearestPerimeterVertex", () => {
      it("returns point on boundary for point inside", () => {
        const result = machine.nearestPerimeterVertex({ x: 0, y: 0 })

        // Should be on the star boundary
        expect(result).toBeInstanceOf(Victor)
        // The nearest edge from center is an inner edge at ~20 units
        expect(result.length()).toBeCloseTo(20, 0)
      })

      it("returns point on boundary for point outside", () => {
        const result = machine.nearestPerimeterVertex({ x: 100, y: 0 })

        // Should be on the star boundary (rightmost tip at ~50)
        expect(result).toBeInstanceOf(Victor)
        expect(result.x).toBeLessThanOrEqual(51)
      })

      it("projects to nearest edge", () => {
        // Point far to the right - should project to rightmost tip area
        const result = machine.nearestPerimeterVertex({ x: 100, y: 0 })

        // Should be on the boundary, roughly at the right tip
        expect(result.x).toBeGreaterThan(40)
        expect(result.x).toBeLessThanOrEqual(51)
      })
    })

    describe("onPerimeter", () => {
      it("returns true for two points on same edge", () => {
        // Get two points on the same edge using proper interpolation
        const edge = machine.edges[0]
        const mid1 = new Victor(
          edge.p1.x * 0.7 + edge.p2.x * 0.3,
          edge.p1.y * 0.7 + edge.p2.y * 0.3,
        )
        const mid2 = new Victor(
          edge.p1.x * 0.3 + edge.p2.x * 0.7,
          edge.p1.y * 0.3 + edge.p2.y * 0.7,
        )

        expect(machine.onPerimeter(mid1, mid2)).toBe(true)
      })

      it("returns false for points on different edges", () => {
        const p1 = machine.edges[0].p1
        const p2 = machine.edges[5].p1

        expect(machine.onPerimeter(p1, p2)).toBe(false)
      })
    })

    describe("getPerimeterPosition and getPerimeterLength", () => {
      it("returns 0 for first boundary vertex", () => {
        const pos = machine.getPerimeterPosition(starVertices[0])

        expect(pos).toBeCloseTo(0, 1)
      })

      it("returns total perimeter length", () => {
        const length = machine.getPerimeterLength()

        // Star perimeter should be positive
        expect(length).toBeGreaterThan(0)
        // Rough estimate: 10 edges, average ~30 units each
        expect(length).toBeGreaterThan(200)
        expect(length).toBeLessThan(500)
      })

      it("positions increase around perimeter", () => {
        const pos0 = machine.getPerimeterPosition(starVertices[0])
        const pos1 = machine.getPerimeterPosition(starVertices[1])
        const pos2 = machine.getPerimeterPosition(starVertices[2])

        expect(pos1).toBeGreaterThan(pos0)
        expect(pos2).toBeGreaterThan(pos1)
      })
    })

    describe("perimeterDistance", () => {
      it("returns distance between adjacent vertices", () => {
        const v1 = starVertices[0]
        const v2 = starVertices[1]
        const dist = machine.perimeterDistance(v1, v2)

        // Should be approximately the edge length
        const directDist = v1.distance(v2)
        expect(dist).toBeCloseTo(directDist, 0)
      })

      it("returns shorter path for opposite vertices", () => {
        // Get vertices on opposite sides
        const v1 = starVertices[0]
        const v5 = starVertices[5] // Halfway around

        const dist = machine.perimeterDistance(v1, v5)
        const totalPerimeter = machine.getPerimeterLength()

        // Should be less than half the perimeter (takes shorter path)
        expect(dist).toBeLessThanOrEqual(totalPerimeter / 2 + 1)
      })
    })

    describe("polish with circle partially inside star", () => {
      it("clips circle correctly when offset to the right", () => {
        // Circle center at (40, 0) with radius 30
        // This means circle goes from x=10 to x=70
        // Star's rightmost point is at ~50
        const circleVertices = createCircle(30, 32, { x: 40, y: 0 })
        const result = machine.polish([...circleVertices])

        // Should have vertices
        expect(result.length).toBeGreaterThan(0)

        // All vertices should be within the star bounds (roughly)
        result.forEach((v) => {
          expect(v.x).toBeLessThanOrEqual(51) // Star's max x is ~50
          expect(v.x).toBeGreaterThanOrEqual(-51)
        })

        // Should include the rightmost star point (47.6, -15.5)
        const hasRightPoint = result.some(
          (v) => v.x > 45 && v.y < 0 && v.y > -20
        )
        expect(hasRightPoint).toBe(true)
      })

      it("preserves segments fully inside the star", () => {
        // Small circle fully inside the star
        const smallCircle = createCircle(10, 16, { x: 0, y: 0 })
        const result = machine.polish([...smallCircle])

        // Should preserve roughly the same number of vertices
        // (might lose one due to closing point)
        expect(result.length).toBeGreaterThanOrEqual(smallCircle.length - 2)
      })

      it("closes the loop when shape starts and ends outside", () => {
        // Large triangle - first vertex (bottom tip in screen coords) is well below star
        // This tests the loop-closing logic in enforceLimits
        const triangle = createTriangle(150, { x: 0, y: 0 })

        // First point (top) should be outside the star
        expect(machine.inBounds(triangle[0])).toBe(false)

        const result = machine.polish([...triangle])

        // Result should form a closed shape with perimeter tracing
        expect(result.length).toBeGreaterThan(3)

        // All points should be inside or on the boundary
        result.forEach((pt) => {
          const nearest = machine.nearestVertex(pt)
          expect(pt.distance(nearest)).toBeLessThan(1)
        })
      })
    })
  })

  describe("with bumpy rectangle boundary (perimeter tracing)", () => {
    let machine
    let bumpyRect

    beforeEach(() => {
      // Rectangle 100x100 with a 20-unit bump on the right side
      // The bump extends from x=50 to x=70, between y=-10 and y=10
      bumpyRect = createBumpyRect(100, 100, 20)
      machine = new PolygonMachine({ minimizeMoves: false }, bumpyRect)
    })

    describe("perimeter tracing follows the bump", () => {
      it("includes bump vertices when clipping a shape that crosses the bump area", () => {
        // Create a horizontal line that goes through the bump area
        // This line exits the rectangle at x=50, then re-enters at x=50
        // The clipped result should trace AROUND the bump, not cut straight
        const horizontalLine = [
          new Victor(-60, 0),  // outside left
          new Victor(80, 0),   // outside right (past the bump)
        ]

        const result = machine.polish([...horizontalLine])

        // The result should include points from the bump
        // Bump vertices are at (70, -10), (70, 10), (50, -10), (50, 10)
        const hasPointInBumpArea = result.some(v => v.x > 55 && v.x <= 70)

        expect(hasPointInBumpArea).toBe(true)
      })

      it("traces around bump when horizontal line crosses the bump", () => {
        // A horizontal line at y=0 that crosses the bump area
        // Goes from inside the rect, through the bump, and out
        const line = [
          new Victor(0, 0),    // inside rect
          new Victor(80, 0),   // outside, past the bump
        ]

        const result = machine.polish([...line])

        // Result should:
        // 1. Start at (0, 0)
        // 2. Exit at x=70 (bump edge), trace perimeter to re-enter
        // 3. But wait, y=0 is inside bump, so it should go all the way to x=70

        // The line should reach the bump's outer edge at x=70
        const hasOuterBumpVertex = result.some(v => v.x >= 69)
        expect(hasOuterBumpVertex).toBe(true)
      })

      it("traces bump perimeter when line exits and re-enters", () => {
        // A line that exits the base rect (not through bump), goes around outside,
        // and re-enters. This should trace the perimeter including the bump.
        //
        // Start inside at (0, 30) - above the bump region
        // Go to (80, 30) - outside the rect (exits at x=50)
        // Then to (80, -30) - still outside
        // Then to (0, -30) - back inside (enters at x=50)
        //
        // The perimeter from exit (50, 30) to entry (50, -30) should trace
        // around the bump: down to (50, 10), out to (70, 10), down to (70, -10),
        // back to (50, -10), then down to (50, -30)
        const path = [
          new Victor(0, 30),   // inside, above bump
          new Victor(80, 30),  // outside right
          new Victor(80, -30), // outside right, lower
          new Victor(0, -30),  // back inside, below bump
        ]

        const result = machine.polish([...path])

        // Should have points at x=70 (the bump's outer edge)
        const hasOuterBumpVertex = result.some(v => v.x >= 69)
        expect(hasOuterBumpVertex).toBe(true)

        // Should have the bump corner vertices (x=70)
        const outerBumpVertices = result.filter(v => v.x >= 69)
        expect(outerBumpVertices.length).toBe(2) // Two corners at (70, 10) and (70, -10)

        // Should have the full perimeter traced (start, exit, 4 bump-related, entry, end)
        expect(result.length).toBeGreaterThanOrEqual(8)
      })

      it("clipped path should not cut through the bump (all points inside or on boundary)", () => {
        // A path that starts inside, exits through the bump, and returns
        // This tests that the clipping respects the bump boundary
        const crossingPath = [
          new Victor(0, 0),     // inside center
          new Victor(80, 0),    // exits through bump (bump is at y=[-10,10])
          new Victor(80, 40),   // outside, above bump
          new Victor(0, 40),    // re-enters through top edge
        ]

        const result = machine.polish([...crossingPath])

        // All result points should be inside or on the boundary
        result.forEach((pt) => {
          const nearest = machine.nearestVertex(pt)
          const distToBoundary = pt.distance(nearest)
          expect(distToBoundary).toBeLessThan(1)
        })

        // Should include the bump's outer edge (x=70)
        const hasOuterBump = result.some(v => v.x >= 69)
        expect(hasOuterBump).toBe(true)

        // Result should have multiple vertices tracing the boundary
        expect(result.length).toBeGreaterThanOrEqual(5)
      })
    })
  })

  describe("rectangle inside pentagon mask (real shapes)", () => {
    it("closes the path when rectangle vertex is exactly on pentagon boundary", () => {
      // Get real shape vertices - pentagon as mask
      const pentagonVertices = getShapeVertices("polygon", { polygonSides: 5 })

      // Create pentagon mask boundary and scale it to 100x100
      const pentagonBoundary = traceBoundary(pentagonVertices)
      const scaledPentagon = resizeVertices([...pentagonBoundary], 100, 100)

      // Create a smaller rectangle centered at origin (40x40)
      // Then shift it so one corner lands exactly on the pentagon boundary
      const rectHalf = 20
      const rectangle = [
        new Victor(-rectHalf, -rectHalf),  // bottom-left
        new Victor(rectHalf, -rectHalf),   // bottom-right
        new Victor(rectHalf, rectHalf),    // top-right
        new Victor(-rectHalf, rectHalf),   // top-left
        new Victor(-rectHalf, -rectHalf),  // close
      ]

      // Pentagon top vertex is at (0, 50) after scaling to 100x100
      // Shift rectangle up so top edge is at y=50 (on the pentagon top vertex)
      const shiftY = 50 - rectHalf  // = 30, so top-right will be at (20, 50)
      const shiftedRect = rectangle.map(v => new Victor(v.x, v.y + shiftY))

      const machine = new PolygonMachine({ minimizeMoves: false }, scaledPentagon)
      const result = machine.polish([...shiftedRect])

      // Result should have vertices
      expect(result.length).toBeGreaterThan(0)

      // The path should close - first and last vertex should be the same or very close
      const first = result[0]
      const last = result[result.length - 1]
      const closingGap = first.distance(last)

      // If path doesn't close, this will fail
      expect(closingGap).toBeLessThan(1)
    })

    it("closes the path when rectangle is entirely inside pentagon", () => {
      const rectangleVertices = getShapeVertices("polygon", { polygonSides: 4 })
      const pentagonVertices = getShapeVertices("polygon", { polygonSides: 5 })

      // Small rectangle entirely inside larger pentagon
      const scaledRect = resizeVertices([...rectangleVertices], 50, 50)
      const pentagonBoundary = traceBoundary(pentagonVertices)
      const scaledPentagon = resizeVertices([...pentagonBoundary], 150, 150)

      const machine = new PolygonMachine({ minimizeMoves: false }, scaledPentagon)
      const result = machine.polish([...scaledRect])

      // All rectangle vertices should be preserved (inside mask)
      expect(result.length).toBeGreaterThanOrEqual(4)

      // Path should close
      const first = result[0]
      const last = result[result.length - 1]
      expect(first.distance(last)).toBeLessThan(1)
    })

    it("includes star perimeter vertices that are inside the rectangle", () => {
      // Rectangle 100x100 centered at origin
      const rectHalf = 50
      const rectangle = [
        new Victor(-rectHalf, -rectHalf),
        new Victor(rectHalf, -rectHalf),
        new Victor(rectHalf, rectHalf),
        new Victor(-rectHalf, rectHalf),
        new Victor(-rectHalf, -rectHalf),
      ]

      // Star mask 100x100, offset to (-18, -18)
      const starVertices = getShapeVertices("star")
      const starBoundary = traceBoundary(starVertices)
      const scaledStar = resizeVertices([...starBoundary], 100, 100)
      const offsetStar = scaledStar.map(v => new Victor(v.x - 18, v.y - 18))

      // Find star vertices that are inside the rectangle
      const starVerticesInsideRect = offsetStar.filter(v =>
        v.x > -rectHalf && v.x < rectHalf && v.y > -rectHalf && v.y < rectHalf
      )

      const machine = new PolygonMachine({ minimizeMoves: false }, offsetStar)
      const result = machine.polish([...rectangle])

      // The result should include vertices near the star vertices that are inside the rect
      starVerticesInsideRect.forEach(starV => {
        const hasNearbyVertex = result.some(v => v.distance(starV) < 2)
        expect(hasNearbyVertex).toBe(true)
      })
    })

    it("clips rectangle to star mask offset to corner - keeps interior only", () => {
      // Rectangle 100x100 centered at origin
      const rectHalf = 50
      const rectangle = [
        new Victor(-rectHalf, -rectHalf),
        new Victor(rectHalf, -rectHalf),
        new Victor(rectHalf, rectHalf),
        new Victor(-rectHalf, rectHalf),
        new Victor(-rectHalf, -rectHalf),
      ]

      // Star mask 100x100, offset to bottom-left (-18, -18)
      // This positions the star so only part overlaps with rectangle
      const starVertices = getShapeVertices("star")
      const starBoundary = traceBoundary(starVertices)
      const scaledStar = resizeVertices([...starBoundary], 100, 100)

      // Offset star to (-18, -18) relative to rectangle center
      const offsetStar = scaledStar.map(v => new Victor(v.x - 18, v.y - 18))

      const machine = new PolygonMachine({ minimizeMoves: false }, offsetStar)
      const result = machine.polish([...rectangle])

      // Result should have vertices
      expect(result.length).toBeGreaterThan(0)

      // All result vertices should be inside or on BOTH the rectangle AND the star
      // (i.e., the intersection of both shapes)
      result.forEach((v, i) => {
        // Must be within rectangle bounds (with small tolerance)
        expect(v.x).toBeGreaterThanOrEqual(-rectHalf - 1)
        expect(v.x).toBeLessThanOrEqual(rectHalf + 1)
        expect(v.y).toBeGreaterThanOrEqual(-rectHalf - 1)
        expect(v.y).toBeLessThanOrEqual(rectHalf + 1)
      })
    })
  })

  describe("open path clipping (line-by-line fallback)", () => {
    it("clips open L-shaped path against star mask", () => {
      const starVertices = createStar(50, 20)
      const machine = new PolygonMachine({ minimizeMoves: false }, starVertices)

      // Open L-path that extends beyond star
      const openPath = createOpenPath()

      const result = machine.polish([...openPath])

      // Should have vertices (path intersects the star)
      expect(result.length).toBeGreaterThan(0)

      // All result points should be inside or on the star boundary
      result.forEach((pt) => {
        const nearest = machine.nearestVertex(pt)
        expect(pt.distance(nearest)).toBeLessThan(1)
      })
    })

    it("clips line that starts outside and enters mask", () => {
      // Rectangle mask 100x100
      const rectMask = [
        new Victor(-50, -50),
        new Victor(50, -50),
        new Victor(50, 50),
        new Victor(-50, 50),
      ]
      const machine = new PolygonMachine({ minimizeMoves: false }, rectMask)

      // Line from outside to inside (open path, 3 segments)
      const path = [
        new Victor(-100, 0),  // outside
        new Victor(0, 0),     // inside
        new Victor(0, 100),   // exits top
      ]

      const result = machine.polish([...path])

      // Should have clipped vertices
      expect(result.length).toBeGreaterThanOrEqual(2)

      // All points should be within bounds
      result.forEach((pt) => {
        expect(pt.x).toBeGreaterThanOrEqual(-51)
        expect(pt.x).toBeLessThanOrEqual(51)
        expect(pt.y).toBeGreaterThanOrEqual(-51)
        expect(pt.y).toBeLessThanOrEqual(51)
      })
    })
  })

  describe("edge cases", () => {
    it("passes through input unchanged when boundary has fewer than 3 vertices", () => {
      const invalidBoundary = [new Victor(0, 0), new Victor(10, 10)]
      const machine = new PolygonMachine({ minimizeMoves: false }, invalidBoundary)

      const input = [new Victor(5, 5), new Victor(15, 15)]
      const result = machine.polish([...input])

      // With invalid boundary, enforceLimits returns early - input passes through
      expect(result.length).toBe(input.length)
    })

    it("returns empty when input is empty", () => {
      const starVertices = createStar(50, 20)
      const machine = new PolygonMachine({ minimizeMoves: false }, starVertices)

      const result = machine.polish([])

      expect(result.length).toBe(0)
    })

    it("handles null/undefined mask vertices gracefully", () => {
      const machine = new PolygonMachine({ minimizeMoves: false }, null)

      expect(machine.boundary.length).toBe(0)
      expect(machine.inBounds({ x: 0, y: 0 })).toBe(false)
    })

    it("handles shape entirely outside mask", () => {
      const starVertices = createStar(50, 20)
      const machine = new PolygonMachine({ minimizeMoves: false }, starVertices)

      // Small square far outside the star
      const farSquare = [
        new Victor(200, 200),
        new Victor(210, 200),
        new Victor(210, 210),
        new Victor(200, 210),
        new Victor(200, 200),
      ]

      const result = machine.polish([...farSquare])

      // Should trace perimeter of mask (nearest points)
      // Result may have vertices, but they should all be on star boundary
      result.forEach((pt) => {
        const nearest = machine.nearestVertex(pt)
        expect(pt.distance(nearest)).toBeLessThan(1)
      })
    })
  })
})
