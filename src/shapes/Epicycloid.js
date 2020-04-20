import Victor from 'victor'
import Shape, { shapeOptions } from './Shape'

const options = {
  ...shapeOptions,
  ...{
    epicycloidA: {
      title: "Large circle radius"
    },
    epicycloidB: {
      title: "Small circle radius"
    },
  }
}

export default class Epicycloid extends Shape {
  constructor() {
    super('Clover')
    this.link = 'http://mathworld.wolfram.com/Epicycloid.html'
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        type: 'epicycloid',
        epicycloidA: 4,
        epicycloidB: 1
      }
    }
  }

  getVertices(state) {
    let points = []
    let a = parseFloat(state.shape.epicycloidA)
    let b = parseFloat(state.shape.epicycloidB)
    let rotations = Number.isInteger(a/b) ? 1 : b

    for (let i=0; i<128*rotations; i++) {
      let angle = Math.PI * 2.0 / 128.0 * i
      let scale = 0.18
      points.push(new Victor(scale * (a + b) * Math.cos(angle) - scale * b * Math.cos(((a + b) / b) * angle),
                         scale * (a + b) * Math.sin(angle) - scale * b * Math.sin(((a + b) / b) * angle)))
    }
    return points
  }

  getOptions() {
    return options
  }
}
