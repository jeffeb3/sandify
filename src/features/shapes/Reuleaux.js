import Victor from "victor"
import Shape from "./Shape"
import i18next from 'i18next'

const options = () => ({
  reuleauxSides: {
    title: i18next.t('shapes.reuleaux.numberOfSides'),
    step: 1,
    min: 2,
    randomMax: 8,
  },
})

export default class Reuleaux extends Shape {
  constructor() {
    super("reuleaux")
    this.label = i18next.t('shapes.reuleaux.reuleaux')
    this.description = i18next.t('shapes.reuleaux.description')
    this.link = "https://en.wikipedia.org/wiki/Reuleaux_polygon"
    this.linkText = i18next.t('shapes.reuleaux.linkText')
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        reuleauxSides: 3,
      },
    }
  }

  getVertices(state) {
    let points = []

    // Construct an equilateral triangle
    let corners = []

    // Initial location at PI/2
    let angle = Math.PI / 2.0

    // How much of the circle in one side?
    let coverageAngle = Math.PI / state.shape.reuleauxSides
    let halfCoverageAngle = 0.5 * coverageAngle

    for (let c = 0; c < state.shape.reuleauxSides; c++) {
      let startAngle = angle + Math.PI - halfCoverageAngle

      corners.push([new Victor(Math.cos(angle), Math.sin(angle)), startAngle])
      angle += (2.0 * Math.PI) / state.shape.reuleauxSides
    }

    let length = 0.5 / Math.cos(Math.PI / 2.0 / state.shape.reuleauxSides)
    const scale = 1.7

    for (let corn = 0; corn < corners.length; corn++) {
      for (let i = 0; i < 128; i++) {
        let angle = coverageAngle * (i / 128.0) + corners[corn][1]

        points.push(
          new Victor(
            scale * (length * corners[corn][0].x + Math.cos(angle)),
            scale * (length * corners[corn][0].y + Math.sin(angle)),
          ),
        )
      }
    }

    return points
  }

  getOptions() {
    return options()
  }
}
