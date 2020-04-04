export const shapeOptions = {
  startingSize: {
    title: 'Starting size',
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
