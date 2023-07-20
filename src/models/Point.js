import Victor from "victor"
import Model from "./Model"

export default class Point extends Model {
  constructor() {
    super('point')
    this.label = "Point"
    this.startingWidth = 1
    this.startingHeight = 1
    this.shouldCache = false
    this.autosize = false
  }

  canChangeSize(state) {
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
