import Victor from "victor"
import Shape from "./Shape"

export default class Point extends Shape {
  constructor() {
    super("point")
    this.label = "Point"
    this.startingWidth = 1
    this.startingHeight = 1
    this.shouldCache = false
    this.autosize = false
    this.randomizable = false
  }

  canChangeSize(state) {
    return false
  }

  canRotate(state) {
    return false
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        // no custom attributes
      },
    }
  }

  getVertices(state) {
    return [new Victor(0.0, 0.0)]
  }

  finalizeVertices(vertices, state, options) {
    if (!options.bounds) {
      return vertices
    }

    // used to calculate bounds of the shape to "hit" purposes in the preview
    const point = vertices[0]

    return [
      new Victor(-20.0, -20.0).add(point),
      new Victor(20.0, 20.0).add(point),
    ]
  }
}
