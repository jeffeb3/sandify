import Victor from 'victor'
import Shape, { shapeOptions } from '../Shape'

const options = {
  ...shapeOptions,
  ...{
    circleLobes: {
      title: 'Number of lobes',
      min: 1
    },
    circleDirection: {
      title: 'Direction',
      type: 'togglebutton',
      choices: ['clockwise', 'counterclockwise']
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
        circleLobes: 1,
        circleDirection: 'clockwise'
      },
    }
  }

  getVertices(state) {
    let points = []

    if (state.shape.circleDirection === 'counterclockwise') {
      for (let i=128; i>=0; i--) {
        let angle = Math.PI * 2.0 / 128.0 * i
        points.push(new Victor(Math.cos(angle), Math.sin(state.shape.circleLobes * angle)/state.shape.circleLobes))
      }
    } else {
      for (let i=0; i<=128; i++) {
        let angle = Math.PI * 2.0 / 128.0 * i
        points.push(new Victor(Math.cos(angle), Math.sin(state.shape.circleLobes * angle)/state.shape.circleLobes))
      }
    }

    return points
  }

  getOptions() {
    return options
  }
}
