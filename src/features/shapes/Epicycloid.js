import Victor from "victor"
import Shape from "./Shape"
import { reduce } from "@/common/util"

const options = {
  epicycloidA: {
    title: "Large circle radius",
    min: 1,
    randomMax: 16,
  },
  epicycloidB: {
    title: "Small circle radius",
    min: 1,
    randomMax: 16,
    random: 0.6,
  },
}

export default class Epicycloid extends Shape {
  constructor() {
    super("epicycloid")
    this.label = "Clover"
    this.link = "http://mathworld.wolfram.com/Epicycloid.html"
    this.linkText = "Wolfram Mathworld"
    this.description =
      "The clover shape is an epicycloid. Imagine two circles, with an outer circle rolling around an inner one. The path created by a point on the outer circle as it rolls is called an epicycloid."
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        epicycloidA: 4,
        epicycloidB: 1,
      },
    }
  }

  getVertices(state) {
    let points = []
    let a = parseInt(state.shape.epicycloidA)
    let b = parseInt(state.shape.epicycloidB)
    let reduced = reduce(a, b)

    a = reduced[0]
    b = reduced[1]

    let rotations = Number.isInteger(a / b) ? 1 : b
    let scale = 1 / (a + 2 * b)

    for (let i = 0; i < 128 * rotations; i++) {
      let angle = ((Math.PI * 2.0) / 128.0) * i

      points.push(
        new Victor(
          (a + b) * Math.cos(angle) - b * Math.cos(((a + b) / b) * angle),
          (a + b) * Math.sin(angle) - b * Math.sin(((a + b) / b) * angle),
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

    while (changes.epicycloidA == changes.epicycloidB) {
      changes = super.randomChanges(layer)
    }

    return changes
  }
}
