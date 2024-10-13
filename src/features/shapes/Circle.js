import Victor from "victor"
import Shape from "./Shape"

const options = {
  circleLobes: {
    title: "Number of lobes",
    min: 1,
    randomMax: 6,
  },
  circleDirection: {
    title: "Direction",
    type: "togglebutton",
    choices: ["clockwise", "counterclockwise"],
  },
}

export default class Circle extends Shape {
  constructor() {
    super("circle")
    this.label = "Circle"
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        circleLobes: 1,
        circleDirection: "clockwise",
        maintainAspectRatio: true,
      },
    }
  }

  getVertices(state) {
    let points = []

    if (state.shape.circleDirection === "counterclockwise") {
      for (let i = 128; i >= 0; i--) {
        let angle = ((Math.PI * 2.0) / 128.0) * i

        points.push(
          new Victor(
            Math.cos(angle),
            Math.sin(state.shape.circleLobes * angle) / state.shape.circleLobes,
          ),
        )
      }
    } else {
      for (let i = 0; i <= 128; i++) {
        let angle = ((Math.PI * 2.0) / 128.0) * i

        points.push(
          new Victor(
            Math.cos(angle),
            Math.sin(state.shape.circleLobes * angle) / state.shape.circleLobes,
          ),
        )
      }
    }

    return points
  }

  getOptions() {
    return options
  }
}
