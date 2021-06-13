import Victor from 'victor'
import seedrandom from 'seedrandom'
import Shape, { shapeOptions } from '../Shape'
import { Circle } from './Circle'
import Graph from '../../common/Graph'
import { eulerianTrail } from '../../common/eulerianTrail'

const ROUNDS = 100 // number of rounds to attempt to create and grow circles
const ATTEMPTS = 50 // number of attempts to create a viable circle each round

const options = {
  ...shapeOptions,
  ...{
    seed: {
      title: 'Random seed',
      min: 1
    },
    startingRadius: {
      title: 'Minimum radius',
      min: 1
    },
    inBounds: {
      title: 'Stay in bounds',
      type: 'checkbox'
    }
  }
}

// adapted from Coding Challenge #50; Animated Circle Packing
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
        startingRadius: 10,
        canTransform: false,
        inBounds: false,
        usesMachine: true,
        repeatEnabled: false,
        canChangeSize: false,
        canRotate: false,
        autosize: false,
      }
    }
  }

  getVertices(state) {
    const machine = state.machine
    this.graph = new Graph()
    this.rng = seedrandom(state.shape.seed)
    this.circles = []
    this.settings = {
      width: Math.abs(machine.maxX - machine.minX),
      height: Math.abs(machine.maxY - machine.minY),
      radius: machine.maxRadius,
      rectangular: machine.rectangular,
      circleRadius: state.shape.startingRadius,
      inBounds: state.shape.inBounds
    }

    this.createCircles()

    let trail = eulerianTrail({edges: Object.values(this.graph.edgeMap)})
    debugger

    return this.drawCircles()
  }

  createCircles() {
    for (let rounds=0; rounds<ROUNDS; rounds++) {
      for (let i=0; i<ATTEMPTS; i++) {
        const possibleC = this.newCircle()

        if (possibleC) {
          this.circles.push(possibleC)
          this.graph.addNode(possibleC)
        }
      }

      this.growCircles()
    }
  }

  newCircle() {
    let x, y

    if (this.settings.rectangular) {
      x = 2 * this.settings.width * this.rng() - this.settings.width
      y = 2 * this.settings.height * this.rng() - this.settings.height
    } else {
      const theta = this.rng() * 2 * Math.PI
      const r = this.rng() * this.settings.radius

      x = r * Math.cos(theta)
      y = r * Math.sin(theta)
    }

    let possibleC = new Circle(x, y, this.settings)
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

  drawCircles() {
    let points = []

    for (let i=0; i< this.circles.length; i++) {
      const circle = this.circles[i]

      for (let i=0; i<=128; i++) {
        let angle = Math.PI * 2.0 / 128.0 * i
        if (circle.theta) angle += circle.theta

        points.push(new Victor(
          circle.x + circle.r*Math.cos(angle),
          circle.y + circle.r*Math.sin(angle)
        ))
      }
    }

    return points
  }

  getOptions() {
    return options
  }
}
