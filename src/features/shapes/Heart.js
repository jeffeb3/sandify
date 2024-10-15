import Victor from "victor"
import Shape from "./Shape"

export default class Heart extends Shape {
  constructor() {
    super("heart")
    this.label = "Heart"
    this.description =
      "Heart curves can be defined mathematically a number of different ways. Our heart shape is a parametric equation."
    this.link = "http://mathworld.wolfram.com/HeartCurve.html"
    this.linkText = "Wolfram Mathworld"
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

  // heart equation from: http://mathworld.wolfram.com/HeartCurve.html
  getVertices(state) {
    const points = []

    for (let i = 0; i < 128; i++) {
      let angle = ((Math.PI * 2.0) / 128.0) * i
      let scale = 0.9

      points.push(
        new Victor(
          scale * 1.0 * Math.pow(Math.sin(angle), 3),
          scale *
            ((13.0 / 16.0) * Math.cos(angle) +
              (-5.0 / 16.0) * Math.cos(2.0 * angle) +
              (-2.0 / 16.0) * Math.cos(3.0 * angle) +
              (-1.0 / 16.0) * Math.cos(4.0 * angle)),
        ),
      )
    }
    return points
  }
}
