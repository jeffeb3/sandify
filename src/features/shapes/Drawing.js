import Victor from "victor"
import Shape from "./Shape"
import { dimensions } from "@/common/geometry"

const options = {
  drawingSimplify: {
    title: "Simplify tolerance",
    min: 0,
    max: 5,
    step: 0.5,
  },
  drawingSmooth: {
    title: "Smoothing iterations",
    min: 0,
    max: 8,
    step: 1,
  },
}

export default class Drawing extends Shape {
  constructor() {
    super("drawing")
    this.label = "Drawing"
    this.selectGroup = "import"
    this.randomizable = false
  }

  canChangeAspectRatio() {
    return true
  }

  getInitialState(props) {
    return {
      ...super.getInitialState(),
      ...{
        drawingPoints: [],
        drawingSimplify: 1,
        drawingSmooth: 3,
        maintainAspectRatio: false,
      },
      ...(props === undefined
        ? {}
        : {
            drawingPoints: props.drawingPoints || [],
          }),
    }
  }

  initialDimensions(props) {
    if (!props || !props.drawingPoints || props.drawingPoints.length < 2) {
      return { width: 100, height: 100, aspectRatio: 1 }
    }

    const vertices = props.drawingPoints.map((p) => new Victor(p.x, p.y))
    const dim = dimensions(vertices)
    const w = Math.max(dim.width, 1)
    const h = Math.max(dim.height, 1)
    return { width: w, height: h, aspectRatio: w / h }
  }

  getVertices(state) {
    const points = state.shape.drawingPoints
    if (!points || points.length < 2) {
      return [new Victor(0, 0)]
    }

    let vertices = points.map((p) => new Victor(p.x, p.y))

    const tolerance = state.shape.drawingSimplify
    if (tolerance > 0) {
      vertices = douglasPeucker(vertices, tolerance)
    }

    const smoothIter = state.shape.drawingSmooth || 0
    if (smoothIter > 0) {
      vertices = chaikinSmooth(vertices, smoothIter)
    }

    return vertices
  }

  getOptions() {
    return options
  }
}

function chaikinSmooth(points, iterations) {
  let result = points
  for (let iter = 0; iter < iterations; iter++) {
    if (result.length < 2) return result
    const smoothed = [result[0]]
    for (let i = 0; i < result.length - 1; i++) {
      const p0 = result[i]
      const p1 = result[i + 1]
      smoothed.push(
        new Victor(0.75 * p0.x + 0.25 * p1.x, 0.75 * p0.y + 0.25 * p1.y),
      )
      smoothed.push(
        new Victor(0.25 * p0.x + 0.75 * p1.x, 0.25 * p0.y + 0.75 * p1.y),
      )
    }
    smoothed.push(result[result.length - 1])
    result = smoothed
  }
  return result
}

function perpendicularDist(pt, a, b) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const lenSq = dx * dx + dy * dy
  if (lenSq === 0) return pt.distance(a)
  return Math.abs((pt.x - a.x) * dy - (pt.y - a.y) * dx) / Math.sqrt(lenSq)
}

function douglasPeucker(points, tolerance) {
  if (points.length <= 2) return points

  const first = points[0]
  const last = points[points.length - 1]
  let maxDist = 0
  let maxIdx = 0

  for (let i = 1; i < points.length - 1; i++) {
    const d = perpendicularDist(points[i], first, last)
    if (d > maxDist) {
      maxDist = d
      maxIdx = i
    }
  }

  if (maxDist > tolerance) {
    const left = douglasPeucker(points.slice(0, maxIdx + 1), tolerance)
    const right = douglasPeucker(points.slice(maxIdx), tolerance)
    return left.slice(0, -1).concat(right)
  }
  return [first, last]
}
