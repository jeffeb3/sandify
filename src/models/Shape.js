export const shapeOptions = {}

export default class Shape {
  constructor(name) {
    this.name = name
  }

  getInitialState() {
    return {
      repeatEnabled: true,
      canTransform: true,
      selectGroup: 'Shapes',
    }
  }

  getInitialTransformState() {
    return {
      startingSize: 10,
      canChangeSize: true,
    }
  }

  getOptions() {
    return shapeOptions
  }

  getVertices(state) {
    return []
  }
}
