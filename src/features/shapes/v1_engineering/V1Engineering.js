import Vicious1Vertices from "./Vicious1Vertices"
import Shape from "../Shape"

export default class V1Engineering extends Shape {
  constructor() {
    super("v1Engineering")
    this.label = "V1Engineering"
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
    return Vicious1Vertices()
  }
}
