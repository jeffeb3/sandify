import Victor from 'victor'
import Shape, { shapeOptions } from '../Shape'

const options = {
  ...shapeOptions,
  ...{
    freeformPoints: {
      title: 'Points',
      type: 'input'
    }
  }
}

export default class Freeform extends Shape {
  constructor() {
    super('Freeform')
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        type: 'freeform',
        freeformPoints: '-1,-1;-1,1;1,1',
        canChangeHeight: false,
        startingWidth: 50,
        startingHeight: 50
      },
    }
  }

  getVertices(state) {
    return state.shape.freeformPoints.split(';').map((pair) => {
      const coordinates = pair.split(',')
      return new Victor(coordinates[0], coordinates[1])
    })
  }

  getOptions() {
    return options
  }
}
