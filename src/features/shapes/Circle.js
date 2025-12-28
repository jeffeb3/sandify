import Victor from "victor"
import Shape from "./Shape"
import i18next from 'i18next'

const options = {
  circleLobes: {
    title: i18next.t('shapes.circle.numberOfLobes'),
    min: 1,
    randomMax: 6,
  },
  circleDirection: {
    title: i18next.t('shapes.circle.direction'),
    type: "togglebutton",
    choices: [
      {"title":i18next.t('shapes.circle.clockwise'), "value":"clockwise"}, 
      {"title":i18next.t('shapes.circle.counterclockwise'), "value":"counterclockwise"}],
  },
}

export default class Circle extends Shape {
  constructor() {
    super("circle")
    this.label = i18next.t('shapes.circle.circle')
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
