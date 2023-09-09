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
}
