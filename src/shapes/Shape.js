export const shapeOptions = {
  startingSize: {
    title: 'Starting size',
    min: 1
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
      selectGroup: "Shapes",
      startingSize: 10
    }
  }

  getOptions() {
    return shapeOptions
  }

  getVertices() {
    return []
  }
}
