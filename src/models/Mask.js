import Victor from 'victor'
import Shape, { shapeOptions } from './Shape'

const options = {
  ...shapeOptions,
  ...{
    maskMachine: {
      title: 'Mask shape',
      type: 'dropdown',
      choices: ['rectangle', 'circle'],
    },
    maskMinimizeMoves: {
      title: 'Try to minimize perimeter moves',
      type: 'checkbox'
    },
    maskBorder: {
      title: 'Draw border',
      type: 'checkbox'
    }
  }
}

export default class Mask extends Shape {
  constructor() {
    super('Mask')
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        type: 'mask',
        canTransform: false,
        shouldCache: false,
        canChangeSize: true,
        repeatEnabled: false,
        autosize: false,
        startingWidth: 100,
        startingHeight: 100,
        maskMinimizeMoves: false,
        maskMachine: 'rectangle',
        maskBorder: false
      }
    }
  }

  getVertices(state) {
    const width = state.shape.startingWidth
    const height = state.shape.startingHeight

    return [
      new Victor(-width/2, height/2),
      new Victor(width/2, height/2),
      new Victor(width/2, -height/2),
      new Victor(-width/2, -height/2),
      new Victor(-width/2, height/2),
    ]
  }

  getOptions() {
    return options
  }
}
