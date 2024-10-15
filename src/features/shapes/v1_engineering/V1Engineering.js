import Vicious1Vertices from "./Vicious1Vertices"
import Shape from "../Shape"

export default class V1Engineering extends Shape {
  constructor() {
    super("v1Engineering")
    this.label = "V1Engineering"
    this.link = "https://www.v1e.com/"
    this.linkText = "V1 Engineering"
    this.description =
      "This shape represents the V1 Engineering logo. V1 Engineering provides low-cost, customizable machine designs. Sandify was created in 2017 by users in their forum."
    this.randomizable = false
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
