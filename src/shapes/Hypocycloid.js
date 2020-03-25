import { Vertex } from '../common/Geometry'
import Shape, { shapeOptions } from './Shape'

const options = {
  ...shapeOptions,
  ...{
    hypocycloidA: {
      title: 'Large circle radius',
      step: 0.1,
    },
    hypocycloidB: {
      title: 'Small circle radius',
      step: 0.1,
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
        hypocycloidA: 1.5,
        hypocycloidB: 0.25
      }
    }
  }

  getVertices(state) {
    let points = []
    let a = parseFloat(state.shape.hypocycloidA)
    let b = parseFloat(state.shape.hypocycloidB)

    for (let i=0; i<128; i++) {
      let angle = Math.PI * 2.0 / 128.0 * i
      points.push(Vertex(1.0 * (a - b) * Math.cos(angle) + b * Math.cos(((a - b) / b) * angle),
                            1.0 * (a - b) * Math.sin(angle) - b * Math.sin(((a - b) / b) * angle)))
    }
    return points
  }

  getOptions() {
    return options
  }
}
