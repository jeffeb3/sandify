import Victor from 'victor'
import Shape, { shapeOptions } from './Shape'

const options = {
  ...shapeOptions,
  ...{
    circleLobes: {
      title: 'Number of lobes',
      min: 1
    }
  }
}

export default class Circle extends Shape {
  constructor() {
    super('Circle')
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        type: 'circle',
        circleLobes: 1
      }
    }
  }

  getVertices(state) {
    let points = []
    for (let i=0; i<=128; i++) {
      let angle = Math.PI * 2.0 / 128.0 * i
      points.push(new Victor(Math.cos(angle), Math.sin(state.shape.circleLobes * angle)/state.shape.circleLobes))
    }
    return points
  }

  getOptions() {
    return options
  }
}
