// TODO
// don't allow pattern to move

import seedrandom from 'seedrandom'
import Shape, { shapeOptions } from '../Shape'
import { Circle } from './Circle'
import Graph from '../../common/Graph'
import { circle, arc } from '../../common/geometry'
import { getMachineInstance } from '../../features/machine/computer'
import Victor from 'victor'

const ROUNDS = 100 // default number of rounds to attempt to create and grow circles
const RECTANGULAR_ATTEMPTS_MULTIPLIER = 4
const ATTEMPTS_MODIFIER = 5

const options = {
  ...shapeOptions,
  ...{
    seed: {
      title: 'Random seed',
      min: 1
    },
    startingRadius: {
      title: 'Minimum radius',
      min: 3
    },
    attempts: {
      title: 'Circle uniformity',
      min: 1,
      max: 100,
      step: 4
    },
    inBounds: {
      title: 'Stay in bounds',
      type: 'checkbox'
    }
  }
}

// adapted initially from Coding Challenge #50; Animated Circle Packing
// https://www.youtube.com/watch?v=QHEQuoIKgNE
export default class CirclePacker extends Shape {
  constructor() {
    super('Circle Packer')
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        type: 'circle_packer',
        selectGroup: 'Erasers',
        seed: 1,
        startingRadius: 4,
        attempts: 20,
        canTransform: false,
        inBounds: false,
        usesMachine: true,
        repeatEnabled: false,
        canChangeSize: false,
        canRotate: false,
        canMove: false,
        autosize: false,
      }
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
      rectangular: machine.rectangular,
      attempts: state.shape.attempts,
      r: state.shape.startingRadius,
      inBounds: state.shape.inBounds
    }
    this.boundaryCircle = new Circle(0, 0, this.settings.maxRadius, this.settings)
    this.boundaryRectangle = [
      new Victor(-this.settings.width / 2, -this.settings.height / 2),
      new Victor(this.settings.width / 2, -this.settings.height / 2),
      new Victor(this.settings.width / 2, this.settings.height / 2),
      new Victor(-this.settings.width / 2, this.settings.height / 2),
    ]

    this.createCircles()
    this.connectOrphans()
    this.drawCircles()

    return this.points
  }

  // generate random circles within machine bounds. Grow them incrementally. If a circle collides
  // with another, stop them growing. Repeat.
  createCircles() {
    let attempts = this.settings.rectangular ?
      this.settings.attempts * RECTANGULAR_ATTEMPTS_MULTIPLIER :
      this.settings.attempts
    const rounds = Math.floor(ROUNDS * (ROUNDS / attempts))

    for (let round=0; round<rounds; round++) {
      for (let i=0; i<attempts + ATTEMPTS_MODIFIER; i++) {
        const possibleC = this.newCircle()

        if (possibleC) {
          this.circles.push(possibleC)
          this.graph.addNode(possibleC)
        }
      }

      this.growCircles()
    }

    this.perimeterCircles = this.circles.filter(circle => circle.perimeter)
  }

  // ensure that we have a fully connected graph to walk
  connectOrphans() {
    this.perimeterCircles.forEach (circle => this.markConnected(circle))

    const center = new Victor(0, 0)
    let orphans = this.circles.filter(circle => !circle.connected)
    let connected = this.circles.filter(circle => circle.connected)

    while(orphans.length > 0) {
      // find orphan furthest from center (closest to perimeter)
      const orphan = this.farthest(orphans, center)

      // find connected circle closest to that orphan
      const connector = this.closest(connected, orphan)

      // connect them
      this.graph.addEdge(orphan, connector)
      this.markConnected(orphan)

      // repeat
      orphans = orphans.filter(circle => !circle.connected)
      connected = this.circles.filter(circle => circle.connected)
    }
  }

  // start with a perimeter circle, draw it and any neighboring circles recursively. Repeat.
  drawCircles() {
    let curr = this.circles.find(circle => circle.perimeter)
    let prev = curr
    let intersection = this.boundaryIntersection(curr)
    let angle = Math.atan2(intersection.y - curr.y, intersection.x - curr.x)
    const stack = []

    while (curr) {
      this.drawCircle(curr, angle)
      angle = this.walk(curr, angle, stack)
      prev = curr
      curr = this.perimeterCircles.find(circle => !circle.walked)

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
      for (let i=0; i< this.circles.length; i++) {
        const c = this.circles[i]
        let d = possibleC.distance(c)

        if (d < (c.r + possibleC.r)) {
          valid = false
          break
        }
      }
    }

    return valid ? possibleC : null
  }

  growCircles() {
    if (this.circles.length > 1) {
      while (this.circles.filter(circle => circle.growing).length > 0) {
        this.circles.forEach(c => {
          if (c.growing) {
            if (c.outOfBounds()) {
              c.growing = false
            } else {
              this.circles.forEach(other => {
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
    const li1 = this.closest(from.lineIntersection(from, to), to)
    const li2 = this.closest(to.lineIntersection(from, to), from)
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
      const li1 = this.closest(c.lineIntersection(c, p1), c)
      a1 = Math.atan2(li1.y - p1.y, li1.x - p1.x)

      if (stack.length > 1) {
        const p2 = stack[1]
        const li2 = this.closest(p1.lineIntersection(p1, p2), p2)

        a2 = Math.atan2(li2.y - p1.y, li2.x - p1.x)
        this.points.push(...arc(p1.r, a1, a2, p1.x, p1.y))

        return a2
      } else {
        return a1
      }
    }
  }

  connectAlongPerimeter(c, end, angle) {
    debugger
    const intersection = this.boundaryIntersection(c)
    const intersection2 = this.boundaryIntersection(end)

    // draw arc to perimeter
    const a2 = Math.atan2(intersection.y - c.y, intersection.x - c.x)
    this.points.push(...arc(c.r, angle, a2, c.x, c.y))

    // connect along perimeter
    const machine = getMachineInstance([], this.settings)
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

  // returns the point in arr that is farthest to a given point
  farthest(arr, point) {
    return arr.reduce((max, x, i, arr) => x.distance(point) > max.distance(point) ? x : max, arr[0])
  }

  // returns the point in arr that is closest to a given point
  closest(arr, point) {
    return arr.reduce((max, x, i, arr) => x.distance(point) < max.distance(point) ? x : max, arr[0])
  }

  getOptions() {
    return options
  }
}
