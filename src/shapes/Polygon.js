import { Vertex } from '../common/Geometry'
import Shape, { shapeOptions } from './Shape'

const options = {
  ...shapeOptions,
  ...{
    polygonSides: {
      title: 'Number of sides',
      min: 3
    }
  }
}

export default class Polygon extends Shape {
  constructor() {
    super('Polygon')
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        type: 'polygon',
        polygonSides: 4
      }
    }
  }

  getVertices(state) {
    let points = []
    for (let i=0; i<state.shape.polygonSides; i++) {
      let angle = Math.PI * 2.0 / state.shape.polygonSides * (0.5 + i)
      points.push(Vertex(Math.cos(angle), Math.sin(angle)))
    }
    return points
  }

  getOptions() {
    return options
  }
}
