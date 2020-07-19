import Victor from 'victor'
import Shape, { shapeOptions } from './Shape'

const options = {
  ...shapeOptions,
  ...{
    image_file: {
      title: 'Load image',
      type: 'file'
    }
  }
}

export default class BWImage extends Shape {
  constructor() {
    super('Image')
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        type: 'bwimage',
        image_file: ""
      }
    }
  }

  getVertices(state) {
    let points = []
    for (let i=0; i<=128; i++) {
      let angle = Math.PI * 2.0 / 128.0 * i
      points.push(new Victor(Math.cos(angle), Math.sin(state.shape.image_name * angle)/state.shape.image_name))
    }
    return points
  }

  getOptions() {
    return options
  }
}
