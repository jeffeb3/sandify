export const shapeOptions = {
  startingSize: {
    title: 'Starting size',
    min: 1,
    isVisible: (state) => { return state.canChangeSize }
  }
}

export default class Shape {
  constructor(name) {
    this.name = name
  }

  getInitialState() {
    return {
      repeatEnabled: true,
      canTransform: true,
      canChangeSize: true,
      selectGroup: 'Shapes',
      startingSize: 10,
    }
  }

  getOptions() {
    return shapeOptions
  }

  getVertices() {
    return []
  }
}
