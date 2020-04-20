import Victor from 'victor'
import Shape, { shapeOptions } from './Shape'

const options = {
  ...shapeOptions,
  ...{
    hypocycloidA: {
      title: 'Large circle radius'
    },
    hypocycloidB: {
      title: 'Small circle radius'
    },
  }
}

export default class Star extends Shape {
  constructor() {
    super('Web')
    this.link = 'http://mathworld.wolfram.com/Hypocycloid.html'
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        type: 'hypocycloid',
        hypocycloidA: 6,
        hypocycloidB: 1
      }
    }
  }

  getVertices(state) {
    let points = []
    let a = parseFloat(state.shape.hypocycloidA)
    let b = parseFloat(state.shape.hypocycloidB)
    let rotations = Number.isInteger(a/b) ? 1 : b

    for (let i=0; i<128*rotations; i++) {
      let angle = Math.PI * 2.0 / 128.0 * i
      let scale = 0.18
      points.push(new Victor(scale * (a - b) * Math.cos(angle) + scale * b * Math.cos(((a - b) / b) * angle),
                         scale * (a - b) * Math.sin(angle) - scale * b * Math.sin(((a - b) / b) * angle)))
    }
    return points
  }

  getOptions() {
    return options
  }
}
