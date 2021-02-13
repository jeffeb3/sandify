import Victor from 'victor'
import Shape, { shapeOptions } from './Shape'
import { reduce } from '../common/util'

const options = {
  ...shapeOptions,
  ...{
    hypocycloidA: {
      title: 'Large circle radius',
      min: 1
    },
    hypocycloidB: {
      title: 'Small circle radius',
      min: 1
    },
  }
}

export default class Star extends Shape {
  constructor() {
    super('Web')
    this.link = 'http://mathworld.wolfram.com/Hypocycloid.html'
    this.linkText = 'Wolfram Mathworld'
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        type: 'hypocycloid',
        hypocycloidA: 6,
        hypocycloidB: 1,
      }
    }
  }

  getVertices(state) {
    let points = []
    let a = parseInt(state.shape.hypocycloidA)
    let b = parseInt(state.shape.hypocycloidB)
    let reduced = reduce(a, b)
    a = reduced[0]
    b = reduced[1]
    let rotations = Number.isInteger(a/b) ? 1 : b
    let scale = b < a ? 1/a : 1/(2*(b - a/2))

    for (let i=0; i<128*rotations; i++) {
      let angle = Math.PI * 2.0 / 128.0 * i
      points.push(
        new Victor(
          (a - b) * Math.cos(angle) + b * Math.cos(((a - b) / b) * angle),
          (a - b) * Math.sin(angle) - b * Math.sin(((a - b) / b) * angle)
        ).multiply({x: scale, y: scale})
      )
    }

    return points
  }

  getOptions() {
    return options
  }
}
