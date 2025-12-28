import Victor from "victor"
import Shape from "../Shape"
import Orbit from "./Orbit"
import i18next from 'i18next'

const options = {
  fractalSpirographVelocity: {
    title: i18next.t('shapes.fractalSpirograph.velocity'),
    min: 2,
  },
  fractalSpirographResolution: {
    title: i18next.t('shapes.fractalSpirograph.resolution'),
    min: 1,
  },
  fractalSpirographNumCircles: {
    title: i18next.t('shapes.fractalSpirograph.numCircles'),
    min: 1,
    max: 6,
    randomMin: 2,
  },
  fractalSpirographRelativeSize: {
    title: i18next.t('shapes.fractalSpirograph.relativeSize'),
    min: 2,
    max: 6,
  },
  fractalSpirographAlternateRotation: {
    title: i18next.t('shapes.fractalSpirograph.alternateRotation'),
    type: "checkbox",
  },
}

// Inspired/adapted from https://thecodingtrain.com/CodingChallenges/061-fractal-spirograph
// No license was specified.
export default class FractalSpirograph extends Shape {
  constructor() {
    super("fractalSpirograph")
    this.label = i18next.t('shapes.fractalSpirograph.fractalSpirograph')
    this.link =
      "https://softologyblog.wordpress.com/2017/02/27/fractal-spirographs/"
    this.linkText = i18next.t('shapes.fractalSpirograph.linkText')
    this.description = i18next.t('shapes.fractalSpirograph.description')
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        fractalSpirographVelocity: 8,
        fractalSpirographResolution: 2,
        fractalSpirographNumCircles: 5,
        fractalSpirographRelativeSize: 3,
        fractalSpirographAlternateRotation: true,
      },
    }
  }

  getVertices(state) {
    let resolution = parseInt(state.shape.fractalSpirographResolution)
    let settings = {
      resolution,
      velocity: parseInt(state.shape.fractalSpirographVelocity),
      numCircles: parseInt(state.shape.fractalSpirographNumCircles),
      relativeSize: parseInt(state.shape.fractalSpirographRelativeSize),
      alternateRotation: state.shape.fractalSpirographAlternateRotation,
    }

    let sun = new Orbit(0, 0, 1, 0, settings)
    let next = sun
    let end
    let points = []

    for (var i = 0; i < settings.numCircles; i++) {
      next = next.addChild()
    }
    end = next

    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < 361; j++) {
        let next = sun

        while (next != null) {
          next.update()
          next = next.child
        }

        points.push(new Victor(end.x, end.y))
      }
    }

    const scale = 5 // to normalize starting size

    points.forEach((point) => point.multiply({ x: scale, y: scale }))

    return points
  }

  getOptions() {
    return options
  }
}
