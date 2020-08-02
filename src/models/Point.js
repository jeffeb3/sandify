import Victor from 'victor'
import Shape, { shapeOptions } from './Shape'

export default class Point extends Shape {
  constructor() {
    super('Point')
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        type: 'point',
        canTransform: false,
        shouldCache: false,
        canChangeSize: false,
        repeatEnabled: false,
      }
    }
  }

  getVertices(state) {
    return [new Victor(0.0, 0.0), new Victor(0.0, 0.1)]
  }
}
