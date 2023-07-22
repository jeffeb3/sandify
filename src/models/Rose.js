import Victor from "victor"
import Model from "./Model"

const options = {
  roseN: {
    title: "Numerator",
    step: 1,
    min: 1,
  },
  roseD: {
    title: "Denominator",
    step: 1,
    min: 1,
  },
}

export default class Rose extends Model {
  constructor() {
    super("rose")
    this.label = "Rose"
    this.link = "http://mathworld.wolfram.com/Rose.html"
    this.linkText = "Rose at Wolfram Mathworld"
    this.startingAspectRatioLocked = false // force a square shape
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
}
