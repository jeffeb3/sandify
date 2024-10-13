import Victor from "victor"
import Shape from "./Shape"

const options = {
  roseN: {
    title: "Numerator",
    step: 1,
    min: 1,
    randomMax: 16,
  },
  roseD: {
    title: "Denominator",
    step: 1,
    min: 1,
    randomMax: 16,
  },
}

export default class Rose extends Shape {
  constructor() {
    super("rose")
    this.label = "Rose"
    this.link = "https://mathworld.wolfram.com/RoseCurve.html"
    this.linkText = "Wolfram Mathworld"
    this.description =
      "A rose curve is a curve which has the shape of a petalled flower."
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        roseN: 3,
        roseD: 2,
        transformMethod: "intact",
      },
    }
  }

  getVertices(state) {
    let points = []
    let a = 2
    let n = parseInt(state.shape.roseN)
    let d = parseInt(state.shape.roseD)
    let p = (n * d) % 2 === 0 ? 2 : 1
    let thetaClose = d * p * 32 * n
    let resolution = 64 * n

    for (let i = 0; i < thetaClose + 1; i++) {
      let theta = ((Math.PI * 2.0) / resolution) * i
      let r = 0.5 * a * Math.sin((n / d) * theta)

      points.push(new Victor(r * Math.cos(theta), r * Math.sin(theta)))
    }

    return points
  }

  getOptions() {
    return options
  }

  randomChanges(layer) {
    let changes = {}

    while (changes.roseN == changes.roseD) {
      changes = super.randomChanges(layer)
    }

    return changes
  }
}
