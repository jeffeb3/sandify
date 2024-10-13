import Victor from "victor"
import Shape from "./Shape"

const options = {
  polygonSides: {
    title: "Number of sides",
    min: 3,
    randomMax: 12,
  },
  roundCorners: {
    title: "Round corners",
    type: "checkbox",
  },
  roundFraction: {
    title: "Round fraction",
    min: 0.05,
    max: 0.5,
    step: 0.025,
    isVisible: (layer, state) => {
      return state.roundCorners
    },
  },
}

export default class Polygon extends Shape {
  constructor() {
    super("polygon")
    this.label = "Polygon"
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        type: "polygon",
        polygonSides: 4,
        roundCorners: false,
        roundFraction: 0.25,
        maintainAspectRatio: true,
      },
    }
  }

  getOptions() {
    return options
  }

  getVertices(state) {
    // beta is the fraction to have rounded.
    const beta = state.shape.roundFraction

    // alpha is the fration to have straight.
    const alpha = 1.0 - beta

    let points = []

    for (let i = 0; i <= state.shape.polygonSides; i++) {
      const angle = ((Math.PI * 2.0) / state.shape.polygonSides) * (0.5 + i)

      if (state.shape.roundCorners && beta !== 0.0) {
        // angles that make up the arc.
        const angleStart = ((Math.PI * 2.0) / state.shape.polygonSides) * i
        const angleEnd = ((Math.PI * 2.0) / state.shape.polygonSides) * (i + 1)
        const angleResolution = 0.1

        if (points.length > 0) {
          // Start with a line. We use a bunch of points for this, so they get stretch about evenly
          // as the curves do.
          const numberOfLinePoints =
            (angleEnd - angleStart) / angleResolution / beta

          points = points.concat(
            this.getLineVertices(
              points[points.length - 1],
              new Victor(
                alpha * Math.cos(angle) + beta * Math.cos(angleStart),
                alpha * Math.sin(angle) + beta * Math.sin(angleStart),
              ),
              numberOfLinePoints,
            ),
          )
        }
        if (i !== state.shape.polygonSides) {
          // Create the arc.
          for (
            let arcAngle = angleStart + angleResolution;
            arcAngle <= angleEnd;
            arcAngle += angleResolution
          ) {
            points.push(
              new Victor(
                alpha * Math.cos(angle) + beta * Math.cos(arcAngle),
                alpha * Math.sin(angle) + beta * Math.sin(arcAngle),
              ),
            )
          }
        }
      } else {
        // Not rounded corners.
        points.push(new Victor(Math.cos(angle), Math.sin(angle)))
      }
    }

    return points
  }

  // Returns a list of points from (start, end] along the line.
  getLineVertices(startPoint, endPoint, numberOfPoints) {
    const resolution = 1.0 / numberOfPoints
    let points = []

    for (let d = resolution; d <= 1.0; d += resolution) {
      points.push(
        new Victor(
          startPoint.x + (endPoint.x - startPoint.x) * d,
          startPoint.y + (endPoint.y - startPoint.y) * d,
        ),
      )
    }
    return points
  }
}
