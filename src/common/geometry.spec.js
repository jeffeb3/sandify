import Victor from "victor"
import {
  centroid,
  pointInPolygon,
  polygonArea,
  toLocalSpace,
  toWorldSpace,
  projectToSegment,
  distanceToSegment,
} from "./geometry"

describe("centroid", () => {
  it("returns origin for empty array", () => {
    expect(centroid([])).toEqual({ x: 0, y: 0 })
  })

  it("returns the point itself for single vertex", () => {
    const result = centroid([new Victor(5, 10)])
    expect(result.x).toBe(5)
    expect(result.y).toBe(10)
  })

  it("calculates centroid of triangle", () => {
    const vertices = [new Victor(0, 0), new Victor(3, 0), new Victor(0, 3)]
    const result = centroid(vertices)
    expect(result.x).toBe(1)
    expect(result.y).toBe(1)
  })

  it("calculates centroid of square", () => {
    const vertices = [
      new Victor(0, 0),
      new Victor(2, 0),
      new Victor(2, 2),
      new Victor(0, 2),
    ]
    const result = centroid(vertices)
    expect(result.x).toBe(1)
    expect(result.y).toBe(1)
  })

  it("excludes duplicate closing vertex", () => {
    // Closed polygon where first and last are the same
    const vertices = [
      new Victor(0, 0),
      new Victor(3, 0),
      new Victor(0, 3),
      new Victor(0, 0), // closing vertex
    ]
    const result = centroid(vertices)
    // Should be same as without closing vertex
    expect(result.x).toBe(1)
    expect(result.y).toBe(1)
  })
})

describe("pointInPolygon", () => {
  const square = [
    [0, 0],
    [10, 0],
    [10, 10],
    [0, 10],
  ]

  it("returns true for point inside polygon", () => {
    expect(pointInPolygon(5, 5, square)).toBe(true)
  })

  it("returns false for point outside polygon", () => {
    expect(pointInPolygon(15, 5, square)).toBe(false)
    expect(pointInPolygon(-5, 5, square)).toBe(false)
  })

  it("handles point on edge (implementation dependent)", () => {
    // Points exactly on edge may return true or false depending on ray casting
    const result = pointInPolygon(0, 5, square)
    expect(typeof result).toBe("boolean")
  })

  it("works with Victor-style objects", () => {
    const squareVictors = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
    ]
    expect(pointInPolygon(5, 5, squareVictors)).toBe(true)
    expect(pointInPolygon(15, 5, squareVictors)).toBe(false)
  })

  it("returns false for empty ring", () => {
    expect(pointInPolygon(5, 5, [])).toBe(false)
  })

  it("handles concave polygon", () => {
    // L-shaped polygon
    const lShape = [
      [0, 0],
      [10, 0],
      [10, 5],
      [5, 5],
      [5, 10],
      [0, 10],
    ]
    expect(pointInPolygon(2, 2, lShape)).toBe(true) // inside
    expect(pointInPolygon(7, 7, lShape)).toBe(false) // in the cutout
  })
})

describe("polygonArea", () => {
  it("returns positive area for counter-clockwise polygon", () => {
    const ccwSquare = [
      new Victor(0, 0),
      new Victor(2, 0),
      new Victor(2, 2),
      new Victor(0, 2),
    ]
    expect(polygonArea(ccwSquare)).toBe(4)
  })

  it("returns negative area for clockwise polygon", () => {
    const cwSquare = [
      new Victor(0, 0),
      new Victor(0, 2),
      new Victor(2, 2),
      new Victor(2, 0),
    ]
    expect(polygonArea(cwSquare)).toBe(-4)
  })

  it("returns 0 for degenerate polygon (line)", () => {
    const line = [new Victor(0, 0), new Victor(5, 5)]
    expect(polygonArea(line)).toBe(0)
  })

  it("calculates area of triangle", () => {
    // Right triangle with legs of 3 and 4, area = 6
    const triangle = [new Victor(0, 0), new Victor(3, 0), new Victor(0, 4)]
    expect(Math.abs(polygonArea(triangle))).toBe(6)
  })
})

describe("toLocalSpace and toWorldSpace", () => {
  it("toLocalSpace applies offset then rotation", () => {
    const vertex = new Victor(10, 0)
    const result = toLocalSpace(vertex.clone(), 5, 0, 0)
    expect(result.x).toBeCloseTo(5)
    expect(result.y).toBeCloseTo(0)
  })

  it("toWorldSpace reverses toLocalSpace", () => {
    const original = new Victor(10, 5)
    const x = 3
    const y = 2
    const rotation = 45

    const local = toLocalSpace(original.clone(), x, y, rotation)
    const restored = toWorldSpace(local, x, y, rotation)

    expect(restored.x).toBeCloseTo(original.x)
    expect(restored.y).toBeCloseTo(original.y)
  })

  it("toWorldSpace applies rotation then offset", () => {
    const vertex = new Victor(5, 0)
    const result = toWorldSpace(vertex.clone(), 10, 0, 0)
    expect(result.x).toBeCloseTo(15)
    expect(result.y).toBeCloseTo(0)
  })
})

describe("projectToSegment", () => {
  it("projects point onto middle of segment", () => {
    const point = new Victor(5, 5)
    const p1 = new Victor(0, 0)
    const p2 = new Victor(10, 0)

    const result = projectToSegment(point, p1, p2)

    expect(result.x).toBeCloseTo(5)
    expect(result.y).toBeCloseTo(0)
  })

  it("clamps to start of segment", () => {
    const point = new Victor(-5, 5)
    const p1 = new Victor(0, 0)
    const p2 = new Victor(10, 0)

    const result = projectToSegment(point, p1, p2)

    expect(result.x).toBeCloseTo(0)
    expect(result.y).toBeCloseTo(0)
  })

  it("clamps to end of segment", () => {
    const point = new Victor(15, 5)
    const p1 = new Victor(0, 0)
    const p2 = new Victor(10, 0)

    const result = projectToSegment(point, p1, p2)

    expect(result.x).toBeCloseTo(10)
    expect(result.y).toBeCloseTo(0)
  })

  it("handles zero-length segment", () => {
    const point = new Victor(5, 5)
    const p1 = new Victor(2, 2)
    const p2 = new Victor(2, 2)

    const result = projectToSegment(point, p1, p2)

    expect(result.x).toBeCloseTo(2)
    expect(result.y).toBeCloseTo(2)
  })
})

describe("distanceToSegment", () => {
  it("returns perpendicular distance to segment", () => {
    const point = new Victor(5, 3)
    const p1 = new Victor(0, 0)
    const p2 = new Victor(10, 0)

    const dist = distanceToSegment(point, p1, p2)

    expect(dist).toBeCloseTo(3)
  })

  it("returns distance to endpoint when point is beyond segment", () => {
    const point = new Victor(-3, 4)
    const p1 = new Victor(0, 0)
    const p2 = new Victor(10, 0)

    const dist = distanceToSegment(point, p1, p2)

    // Distance to (0,0) = sqrt(9 + 16) = 5
    expect(dist).toBeCloseTo(5)
  })

  it("returns 0 when point is on segment", () => {
    const point = new Victor(5, 0)
    const p1 = new Victor(0, 0)
    const p2 = new Victor(10, 0)

    const dist = distanceToSegment(point, p1, p2)

    expect(dist).toBeCloseTo(0)
  })
})
