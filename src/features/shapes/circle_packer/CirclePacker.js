import seedrandom from "seedrandom"
import Shape from "../Shape"
import { Circle } from "./Circle"
import Graph from "@/common/Graph"
import { circle, arc } from "@/common/geometry"
import { closest, farthest } from "@/common/proximity"
import { getMachine } from "@/features/machines/machineFactory"
import Victor from "victor"

const ROUNDS = 100 // default number of rounds to attempt to create and grow circles
const RECTANGULAR_ATTEMPTS_MULTIPLIER = 4
const ATTEMPTS_MODIFIER = 5

const options = {
  seed: {
    title: "Random seed",
    min: 1,
    randomMax: 1000,
  },
  startingRadius: {
    title: "Minimum radius",
    min: 3,
    randomMax: 40,
  },
  attempts: {
    title: "Circle uniformity",
    min: 1,
    max: 100,
    step: 4,
  },
  inBounds: {
    title: "Stay in bounds",
    type: "checkbox",
  },
}

// adapted initially from Coding Challenge #50; Animated Circle Packing, https://www.youtube.com/watch?v=QHEQuoIKgNE
// no license was specified
export default class CirclePacker extends Shape {
  constructor() {
    super("circlePacker")
    this.label = "Circle packer"
    this.usesMachine = true
    this.autosize = false
    this.selectGroup = "Erasers"
    this.link = "https://en.wikipedia.org/wiki/Circle_packing"
    this.linkText = "Wikipedia"
    this.description =
      "Circle packing is an arrangement of circles of varying sizes such that no overlapping occurs and no circle can be enlarged without creating an overlap."
  }

  canMove(state) {
    return false
  }

  canChangeSize(state) {
    return false
  }

  canRotate(state) {
    return false
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        seed: 1,
        startingRadius: 4,
        attempts: 20,
        inBounds: false,
      },
    }
  }

  getVertices(state) {
    const machine = state.machine

    this.graph = new Graph()
    this.rng = seedrandom(state.shape.seed)
    this.circles = []
    this.points = []
    this.settings = {
      width: Math.abs(machine.maxX - machine.minX),
      height: Math.abs(machine.maxY - machine.minY),
      maxX: machine.maxX,
      maxY: machine.maxY,
      minX: machine.minX,
      minY: machine.minY,
      maxRadius: machine.maxRadius,
      rectangular: machine.type === "rectangular",
      attempts: state.shape.attempts,
      r: state.shape.startingRadius,
      inBounds: state.shape.inBounds,
    }
    this.boundaryCircle = new Circle(
      0,
      0,
      this.settings.maxRadius,
      this.settings,
    )
    this.boundaryRectangle = [
      new Victor(-this.settings.width / 2, -this.settings.height / 2),
      new Victor(this.settings.width / 2, -this.settings.height / 2),
      new Victor(this.settings.width / 2, this.settings.height / 2),
      new Victor(-this.settings.width / 2, this.settings.height / 2),
    ]

    // uncomment and modify this method to add hard-wired circles to the pattern before it starts
    // this.setupCircles()
    this.createCircles()
    this.connectOrphans()
    this.drawCircles()

    return this.points
  }

  // experimental
  setupCircles() {
    const circles = [new Circle(0, 0, 75, { ...this.settings, growing: false })]

    for (const c of circles) {
      this.addCircle(c)
    }
  }

  // generate random circles within machine bounds. Grow them incrementally. If a circle collides
  // with another, stop them growing. Repeat.
  createCircles() {
    let attempts = this.settings.rectangular
      ? this.settings.attempts * RECTANGULAR_ATTEMPTS_MULTIPLIER
      : this.settings.attempts

    if (attempts <= 0) {
      attempts = 1
    }

    const rounds = Math.floor(ROUNDS * (ROUNDS / attempts))

    for (let round = 0; round < rounds; round++) {
      for (let i = 0; i < attempts + ATTEMPTS_MODIFIER; i++) {
        const possibleC = this.newCircle()

        if (possibleC) {
          this.addCircle(possibleC)
        }
      }

      this.growCircles()
    }

    this.perimeterCircles = this.circles.filter((circle) => circle.perimeter)
  }

  // ensure that we have a fully connected graph to walk
  connectOrphans() {
    this.perimeterCircles.forEach((circle) => this.markConnected(circle))

    const center = new Victor(0, 0)
    let orphans = this.circles.filter((circle) => !circle.connected)
    let connected = this.circles.filter((circle) => circle.connected)

    while (orphans.length > 0) {
      // find orphan furthest from center (closest to perimeter)
      const orphan = farthest(orphans, center)

      // find connected circle closest to that orphan
      const connector = closest(connected, orphan)

      // connect them
      this.graph.addEdge(orphan, connector)
      this.markConnected(orphan)

      // repeat
      orphans = orphans.filter((circle) => !circle.connected)
      connected = this.circles.filter((circle) => circle.connected)
    }
  }

  // start with a perimeter circle, draw it and any neighboring circles recursively. Repeat.
  drawCircles() {
    let curr = this.circles.find((circle) => circle.perimeter)
    let prev = curr
    let intersection = this.boundaryIntersection(curr)
    let angle = Math.atan2(intersection.y - curr.y, intersection.x - curr.x)
    const stack = []

    while (curr) {
      this.drawCircle(curr, angle)
      angle = this.walk(curr, angle, stack)
      prev = curr
      curr = this.perimeterCircles.find((circle) => !circle.walked)

      if (curr) {
        angle = this.connectAlongPerimeter(prev, curr, angle)
      }
    }
    intersection = this.boundaryIntersection(prev)

    const angle2 = Math.atan2(intersection.y - prev.y, intersection.x - prev.x)

    this.points.push(...arc(prev.r, angle, angle2, prev.x, prev.y))
  }

  newCircle() {
    let x, y

    if (this.settings.rectangular) {
      x = 2 * this.settings.width * this.rng() - this.settings.width
      y = 2 * this.settings.height * this.rng() - this.settings.height
    } else {
      const theta = this.rng() * 2 * Math.PI
      const r = this.rng() * this.settings.maxRadius

      x = r * Math.cos(theta)
      y = r * Math.sin(theta)
    }

    let possibleC = new Circle(x, y, this.settings.r, this.settings)
    let valid = !possibleC.outOfBounds()

    if (valid) {
      for (let i = 0; i < this.circles.length; i++) {
        const c = this.circles[i]
        let d = possibleC.distance(c)

        if (d < c.r + possibleC.r) {
          valid = false
          break
        }
      }
    }

    return valid ? possibleC : null
  }

  growCircles() {
    if (this.circles.length > 1) {
      while (this.circles.filter((circle) => circle.growing).length > 0) {
        this.circles.forEach((c) => {
          if (c.growing) {
            if (c.outOfBounds()) {
              c.growing = false
            } else {
              this.circles.forEach((other) => {
                if (c !== other) {
                  let d = c.distance(other)
                  if (d < c.r + other.r) {
                    c.growing = false
                    this.graph.addEdge(c, other)
                  }
                }
              })
            }

            c.grow()
          }
        })
      }
    }
  }

  markConnected(c) {
    c.connected = true
    const neighbors = this.graph.neighbors(c)

    for (const curr of neighbors) {
      if (!curr.connected) {
        this.markConnected(curr)
      }
    }
  }

  drawCircle(c, angle) {
    if (!c.drawn) {
      this.points.push(...circle(c.r, angle, c.x, c.y))
      c.drawn = true
    }
  }

  drawConnectingArc(from, to, startingAngle) {
    const li1 = closest(from.lineIntersection(from, to), to)
    const li2 = closest(to.lineIntersection(from, to), from)
    const a2 = Math.atan2(li1.y - from.y, li1.x - from.x)
    const a3 = Math.atan2(li2.y - to.y, li2.x - to.x)

    this.points.push(...arc(from.r, startingAngle, a2, from.x, from.y))

    return a3
  }

  walk(c, angle, stack) {
    const neighbors = this.graph.neighbors(c)
    let a1 = angle

    c.walked = true
    stack.unshift(c)

    for (const curr of neighbors) {
      if (!curr.walked) {
        const a2 = this.drawConnectingArc(c, curr, a1)
        a1 = this.walk(curr, a2, stack)
      }
    }

    this.points.push(...circle(c.r, a1, c.x, c.y))
    return this.walkBack(stack) || a1
  }

  walkBack(stack) {
    const c = stack.shift()
    let a1, a2

    if (stack.length > 0) {
      const p1 = stack[0]
      const li1 = closest(c.lineIntersection(c, p1), c)

      a1 = Math.atan2(li1.y - p1.y, li1.x - p1.x)

      if (stack.length > 1) {
        const p2 = stack[1]
        const li2 = closest(p1.lineIntersection(p1, p2), p2)

        a2 = Math.atan2(li2.y - p1.y, li2.x - p1.x)
        this.points.push(...arc(p1.r, a1, a2, p1.x, p1.y))

        return a2
      } else {
        return a1
      }
    }
  }

  connectAlongPerimeter(c, end, angle) {
    const intersection = this.boundaryIntersection(c)
    const intersection2 = this.boundaryIntersection(end)

    // draw arc to perimeter
    const a2 = Math.atan2(intersection.y - c.y, intersection.x - c.x)

    this.points.push(...arc(c.r, angle, a2, c.x, c.y))

    // connect along perimeter
    const machine = getMachine({
      ...this.settings,
      type: this.settings.rectangular ? "rectangular" : "polar",
    })

    this.points.push(...machine.tracePerimeter(intersection, intersection2))
    this.points.push(intersection2)

    // return angle at intersection between end and perimeter
    return Math.atan2(intersection2.y - end.y, intersection2.x - end.x)
  }

  boundaryIntersection(c) {
    if (this.settings.rectangular) {
      return c.rectangleIntersection(...this.boundaryRectangle)[0]
    } else {
      return c.intersection(this.boundaryCircle)[0]
    }
  }

  addCircle(c) {
    this.circles.push(c)
    this.graph.addNode(c)
  }

  getOptions() {
    return options
  }
}
