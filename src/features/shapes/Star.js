import Victor from "victor"
import Shape from "./Shape"

const options = {
  points: {
    title: "Number of points",
    min: 2,
    randomMax: 8,
  },
  starRatio: {
    title: "Size of points",
    step: 0.05,
    min: 0.05,
    max: 0.8,
  },
}

export default class Star extends Shape {
  constructor() {
    super("star")
    this.label = "Star"
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        points: 5,
        starRatio: 0.5,
      },
    }
  }

  getOptions() {
    return options
  }

  getVertices(state) {
    let points = []

    for (let i = 0; i <= state.shape.points * 2; i++) {
      let angle = ((Math.PI * 2.0) / (2.0 * state.shape.points)) * i
      let star_scale = 1.0

      if (i % 2 === 0) {
        star_scale *= state.shape.starRatio
      }
      points.push(
        new Victor(star_scale * Math.cos(angle), star_scale * Math.sin(angle)),
      )
    }

    return points
  }
}
