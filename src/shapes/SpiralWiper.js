import Victor from 'victor'
import Shape, { shapeOptions } from './Shape'

const options = {
  ...shapeOptions,
  ...{
    wiperSize: {
      title: 'Wiper size',
      min: 1
    },
  }
}

export default class SpiralWiper extends Shape {
  constructor() {
    super('SpiralWiper')
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        type: 'spiral_wiper',
        wiperSize: 12,
        startingSize: 1,
        canChangeSize: false,
        repeatEnabled: false,
        selectGroup: 'Erasers',
        canTransform: false
      }
    }
  }

  getVertices(state) {

    // Determine the max radius
    let maxRadius = state.machine.maxRadius
    if (state.machine.rectangular) {
      const halfHeight = (state.machine.maxY - state.machine.minY)/2.0
      const halfWidth = (state.machine.maxX - state.machine.minX)/2.0
      maxRadius = Math.sqrt(Math.pow(halfHeight, 2.0) + Math.pow(halfWidth, 2.0))
    }

    var vertices = []

    let emergencyBreak = 0
    let radius = 0.1
    let angle = 0
    const arcLength = 1.0
    const radiusPerAngle = state.shape.wiperSize / (2.0 * Math.PI)
    while (radius <= maxRadius) {
      // Save where we are right now.
      vertices.push(new Victor(radius * Math.cos(angle), radius * Math.sin(angle)))

      // We want to have the next point be about the right arc length.
      let deltaAngle = arcLength / radius * 2.0 * Math.PI

      // Limit this at small radii
      deltaAngle = Math.min(deltaAngle, 0.1)

      // Update for the next point.
      angle += deltaAngle
      radius += deltaAngle * radiusPerAngle

      emergencyBreak += 1
      if (emergencyBreak > 1e9) {
        // If we get to this point: bail. We did something terrible.
        break
      }
    }

    return vertices
  }

  getOptions() {
    return options
  }
}
