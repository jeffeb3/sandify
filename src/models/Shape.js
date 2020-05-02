export const shapeOptions = {}

export default class Shape {
  constructor(name) {
    this.name = name
    this.cache = []
  }

  getInitialState() {
    return {
      repeatEnabled: true,
      canTransform: true,
      selectGroup: 'Shapes',
      shouldCache: true,
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

  getVerticesWithCache(state) {
    this.cache.forEach( (cachedShape) => {
      var [shape, vertices] = cachedShape
      if (JSON.stringify(state.shape) === JSON.stringify(shape)) {
        return vertices
      }
    })
    const shapeVertices = this.getVertices(state)
    this.cache.push([state.shape, shapeVertices])
    return shapeVertices
  }

  getVertices(state) {
    return []
  }
}
