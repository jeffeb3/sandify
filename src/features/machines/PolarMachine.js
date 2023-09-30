import {
  onSegment,
  arc,
  angle,
  annotateVertex,
  cloneVertex,
  subsample,
  circle,
} from "@/common/geometry"
import Victor from "victor"
import Machine, { machineOptions } from "./Machine"

const polarMachineOptions = {
  maxRadius: {
    title: "Max radius (mm)",
    min: 0,
  },
  polarStartPoint: {
    title: "Start point",
    type: "togglebutton",
    choices: ["none", "center", "perimeter"],
  },
  polarEndPoint: {
    title: "End point",
    type: "togglebutton",
    choices: ["none", "center", "perimeter"],
  },
  ...machineOptions,
}

export default class PolarMachine extends Machine {
  constructor(state) {
    super(state)
    this.label = "Polar"
    this.sizeX = this.state.maxRadius * 2
    this.sizeY = this.sizeX
    this.height = this.sizeX
    this.width = this.sizeX
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        type: "polar",
        maxRadius: 250,
        polarStartPoint: "none",
        polarEndPoint: "none",
      },
    }
  }

  getOptions() {
    return polarMachineOptions
  }

  addStartPoint() {
    const maxRadius = this.state.maxRadius

    if (this.state.polarStartPoint !== "none") {
      if (this.state.polarStartPoint === "center") {
        this.vertices.unshift(
          annotateVertex(new Victor(0.0, 0.0), { connect: true }),
        )
      } else {
        const first = this.vertices[0]
        const scale = maxRadius / first.magnitude()
        const startPoint = cloneVertex(first).multiply(new Victor(scale, scale))
        this.vertices.unshift(
          annotateVertex(new Victor(startPoint.x, startPoint.y), {
            connect: true,
          }),
        )
      }
    }
  }

  addEndPoint() {
    const maxRadius = this.state.maxRadius

    if (this.state.polarEndPoint !== "none") {
      if (this.state.polarEndPoint === "center") {
        this.vertices[this.vertices.length - 1].connect = true
        this.vertices.push(
          annotateVertex(new Victor(0.0, 0.0), { connect: true }),
        )
      } else {
        const last = this.vertices[this.vertices.length - 1]
        const scale = maxRadius / last.magnitude()
        const endPoint = cloneVertex(last).multiply(new Victor(scale, scale))
        this.vertices[this.vertices.length - 1].connect = true
        this.vertices.push(
          annotateVertex(new Victor(endPoint.x, endPoint.y), { connect: true }),
        )
      }
    }
  }

  // remove all non-essential perimeter vertices. returns a list of segments
  // involving non-perimeter paths
  stripExtraPerimeterVertices() {
    // Subsampling to protect against the case where there is a straight line connecting two
    // perimeter points directly. In this case, we want to register that as a non-perimeter
    // move, or it will be incorrectly optimized out of the final vertices. These extra vertices
    // will be removed later by the machine if possible.
    this.vertices = subsample(
      this.vertices,
      Math.min(this.sizeX, this.sizeY) / 50,
    )
    return super.stripExtraPerimeterVertices()
  }

  // Finds the nearest vertex that is in the bounds of the circle. This will change the
  // shape. i.e. this doesn't care about the line segment, only about the point.
  nearestVertex(vertex) {
    const size = this.state.maxRadius

    if (vertex.length() > size) {
      // try to prevent floating point math from pushing us out of bounds
      const precisionModifier = 0.0001
      const scale = (size - precisionModifier) / vertex.length()

      return cloneVertex(vertex).multiply(new Victor(scale, scale))
    } else {
      return vertex
    }
  }

  inBounds(vertex) {
    return vertex.length() < this.state.maxRadius
  }

  // Returns the nearest perimeter vertex to the given vertex.
  nearestPerimeterVertex(vertex) {
    if (vertex) {
      return new Victor(
        Math.cos(vertex.angle()) * this.state.maxRadius,
        Math.sin(vertex.angle()) * this.state.maxRadius,
      )
    } else {
      return new Victor(0, 0)
    }
  }

  // Returns the distance along the perimeter between two points.
  perimeterDistance(v1, v2) {
    const startAngle = angle(v1)
    const endAngle = angle(v2)
    let deltaAngle = Math.abs(endAngle - startAngle)

    if (deltaAngle > Math.PI) {
      deltaAngle -= 2.0 * Math.PI
    }

    return Math.abs(deltaAngle) * this.state.maxRadius
  }

  // Returns points along the circle from the start to the end, tracing a circle of radius size.
  tracePerimeter(start, end) {
    return arc(this.state.maxRadius, start.angle(), end.angle())
  }

  outlinePerimeter() {
    const last = this.vertices[this.vertices.length - 1]

    if (last) {
      this.vertices = this.vertices.concat(
        circle(this.state.maxRadius, last.angle()),
      )
    }
    return this
  }

  // Returns whether a given path lies on the perimeter of the circle.
  onPerimeter(v1, v2, delta = 1) {
    const rm = Math.sqrt(Math.pow(this.state.maxRadius, 2))
    const r1 = Math.sqrt(Math.pow(v1.x, 2) + Math.pow(v1.y, 2))
    const r2 = Math.sqrt(Math.pow(v2.x, 2) + Math.pow(v2.y, 2))

    return Math.abs(r1 - rm) < delta && Math.abs(r2 - rm) < delta
  }

  // The guts of logic for this limits enforcer. It will take a single line (defined by
  // start and end) and if the line goes out of bounds, returns the vertices around the
  // outside edge to follow around without messing up the shape of the vertices.
  clipSegment(start, end) {
    // Cases:
    // 1 - Entire line is inside
    //     return start, end
    // 2 - Entire line is outside
    //     trace from start to end
    // 3 - only start is inside
    //     find the intersection
    //     include start
    //     include intersection
    //     trace from intersection to closest to end point
    // 4 - only end is inside
    //     do reverse of 3
    // 4 - Neither end is inside, but there is some line segment inside
    //     find both intersections
    //     trace from start to first intersction
    //     trace from second intersection to end
    const size = this.state.maxRadius
    const radStart = start.magnitude()
    const radEnd = end.magnitude()

    if (radStart <= size && radEnd <= size) {
      // The whole segment is inside
      return [start, end]
    }

    // Check for the odd case of coincident points
    if (start.distance(end) < 0.00001) {
      return [this.nearestVertex(start)]
    }

    const intersections = this.getIntersections(start, end)

    if (!intersections.intersection) {
      // The whole line is outside, just trace.
      return this.tracePerimeter(start, end)
    }

    // if neither point is on the segment, then it should just be a trace
    if (!intersections.points[0].on && !intersections.points[1].on) {
      return this.tracePerimeter(start, end)
    }

    // If both points are outside, but there's an intersection
    if (radStart > size + 1.0e-9 && radEnd > size + 1.0e-9) {
      let point = intersections.points[0].point
      let otherPoint = intersections.points[1].point

      return [
        ...this.tracePerimeter(start, point),
        point,
        ...this.tracePerimeter(otherPoint, end),
      ]
    }

    // If we're here, then one point is still in the circle.
    if (radStart <= size) {
      const point1 =
        intersections.points[0].on &&
        Math.abs(intersections.points[0].point - start) > 0.0001
          ? intersections.points[0].point
          : intersections.points[1].point

      return [
        start,
        ...this.tracePerimeter(point1, end),
        this.nearestPerimeterVertex(end),
      ]
    } else {
      const point1 = intersections.points[0].on
        ? intersections.points[0].point
        : intersections.points[1].point

      return [...this.tracePerimeter(start, point1), point1, end]
    }
  }

  getIntersections(start, end) {
    const size = this.state.maxRadius
    let direction = end.clone().subtract(start).clone().normalize()
    let t = direction.x * -1.0 * start.x + direction.y * -1.0 * start.y
    let e = direction.clone().multiply(Victor(t, t)).add(start)
    let distanceToLine = e.magnitude()

    if (distanceToLine >= size) {
      return {
        intersection: false,
        points: [],
      }
    }

    const dt = Math.sqrt(size * size - distanceToLine * distanceToLine)
    const point1 = direction
      .clone()
      .multiply(Victor(t - dt, t - dt))
      .add(start)
    const point2 = direction
      .clone()
      .multiply(Victor(t + dt, t + dt))
      .add(start)
    const s1 = onSegment(start, end, point1)
    const s2 = onSegment(start, end, point2)

    if (s1 || s2) {
      return {
        intersection: true,
        points: [
          {
            point: point1,
            on: s1,
          },
          {
            point: point2,
            on: s2,
          },
        ],
      }
    } else {
      return {
        intersection: false,
        points: [],
      }
    }
  }

  // returns the points if any that intersect with the line represented by start and end
  clipLine(start, end) {
    return this.getIntersections(start, end).points.map((pt) => pt.point)
  }
}
