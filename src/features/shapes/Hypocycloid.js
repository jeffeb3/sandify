import Victor from "victor"
import { reduce } from "@/common/util"
import Shape from "./Shape"

const options = {
  hypocycloidA: {
    title: "Large circle radius",
    min: 1,
    randomMax: 16,
  },
  hypocycloidB: {
    title: "Small circle radius",
    min: 1,
    randomMax: 16,
    random: 0.6,
  },
}

export default class Star extends Shape {
  constructor() {
    super("hypocycloid")
    this.label = "Web"
    this.link = "http://mathworld.wolfram.com/Hypocycloid.html"
    this.linkText = "Wolfram Mathworld"
    this.description =
      "The web shape is a hypocycloid. Imagine two circles, with an inner circle rolling around inside an outer one. The path created by a point on the inner circle as it rolls is called a hypocycloid."
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        hypocycloidA: 6,
        hypocycloidB: 1,
      },
    }
  }

  getVertices(state) {
    let points = []
    let a = parseInt(state.shape.hypocycloidA)
    let b = parseInt(state.shape.hypocycloidB)
    let reduced = reduce(a, b)
    a = reduced[0]
    b = reduced[1]
    let rotations = Number.isInteger(a / b) ? 1 : b
    let scale = b < a ? 1 / a : 1 / (2 * (b - a / 2))

    for (let i = 0; i < 128 * rotations; i++) {
      let angle = ((Math.PI * 2.0) / 128.0) * i
      points.push(
        new Victor(
          (a - b) * Math.cos(angle) + b * Math.cos(((a - b) / b) * angle),
          (a - b) * Math.sin(angle) - b * Math.sin(((a - b) / b) * angle),
        ).multiply({ x: scale, y: scale }),
      )
    }

    return points
  }

  getOptions() {
    return options
  }

  randomChanges(layer) {
    let changes = {}

    while (
      changes.hypocycloidA == changes.hypocycloidB ||
      changes.hypocycloidA / changes.hypocycloidB == 2
    ) {
      changes = super.randomChanges(layer)
    }

    return changes
  }
}
