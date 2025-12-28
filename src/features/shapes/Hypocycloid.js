import Victor from "victor"
import { reduce } from "@/common/util"
import Shape from "./Shape"
import i18next from 'i18next'

const options = {
  hypocycloidA: {
    title: i18next.t('shapes.hypocycloid.largeCircleRadius'),
    min: 1,
    randomMax: 16,
  },
  hypocycloidB: {
    title: i18next.t('shapes.hypocycloid.smallCircleRadius'),
    min: 1,
    randomMax: 16,
    random: 0.6,
  },
}

export default class Star extends Shape {
  constructor() {
    super("hypocycloid")
    this.label = i18next.t('shapes.hypocycloid.hypocycloid')
    this.link = "http://mathworld.wolfram.com/Hypocycloid.html"
    this.linkText = i18next.t('shapes.hypocycloid.linkText')
    this.description = i18next.t('shapes.hypocycloid.description')
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
