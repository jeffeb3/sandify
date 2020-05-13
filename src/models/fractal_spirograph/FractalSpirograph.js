import Victor from 'victor'
import Shape, { shapeOptions } from '../Shape'
import Orbit from './Orbit'

const options = {
  ...shapeOptions,
  ...{
    fractalSpirographVelocity: {
      title: 'Velocity',
      min: 2
    },
    fractalSpirographResolution: {
      title: 'Resolution',
      min: 1
    },
    fractalSpirographNumCircles: {
      title: 'Number of circles',
      min: 1,
      max: 6
    },
    fractalSpirographRelativeSize: {
      title: 'Relative size (parent to child circle)',
      min: 2,
      max: 6
    },
    fractalSpirographAlternateRotation: {
      title: 'Alternate rotation direction',
      type: 'checkbox'
    },
  }
}

// Inspired/adapted from https://thecodingtrain.com/CodingChallenges/061-fractal-spirograph
export default class FractalSpirograph extends Shape {
  constructor() {
    super('Fractal Spirograph')
    this.link = 'https://benice-equation.blogspot.com/2012/01/fractal-spirograph.html'
    this.linkText = 'Fun math art (pictures) - benice equation'
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        type: 'fractal_spirograph',
        fractalSpirographVelocity: 8,
        fractalSpirographResolution: 2,
        fractalSpirographNumCircles: 5,
        fractalSpirographRelativeSize: 3,
        fractalSpirographAlternateRotation: true,
        startingSize: 54,
        repeatEnabled: false,
      }
    }
  }

  getVertices(state) {
    let resolution = parseInt(state.shape.fractalSpirographResolution)
    let settings = {
      resolution: resolution,
      velocity: parseInt(state.shape.fractalSpirographVelocity),
      numCircles: parseInt(state.shape.fractalSpirographNumCircles),
      relativeSize: parseInt(state.shape.fractalSpirographRelativeSize),
      alternateRotation: state.shape.fractalSpirographAlternateRotation
    }

    let sun = new Orbit(0, 0, 1, 0, settings)
    let next = sun
    let end
    let points = []

    for (var i=0; i<settings.numCircles; i++) {
      next = next.addChild()
    }
    end = next

    for (let i=0; i<resolution; i++) {
      for (let j=0; j<361; j++) {
        let next = sun

        while (next != null) {
          next.update()
          next = next.child
        }

        points.push(new Victor(end.x, end.y))
      }
    }

    return points
  }

  getOptions() {
    return options
  }
}
