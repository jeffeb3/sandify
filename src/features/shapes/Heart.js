import Victor from "victor"
import Shape from "./Shape"

export default class Heart extends Shape {
  constructor() {
    super("heart")
    this.label = "Heart"
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
    const points = []
    for (let i = 0; i < 128; i++) {
      let angle = ((Math.PI * 2.0) / 128.0) * i
      let scale = 0.9
      // heart equation from: http://mathworld.wolfram.com/HeartCurve.html
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
