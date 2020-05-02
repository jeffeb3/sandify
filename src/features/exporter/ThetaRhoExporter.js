import Victor from 'victor'
import Exporter from './Exporter'

function thetarho(vertex) {
  return '' + vertex.x.toFixed(5) + ' ' + vertex.y.toFixed(5)
}

export default class ThetaRhoExporter extends Exporter {
  constructor(props) {
    super(props)
    this.fileExtension = '.thr'
    this.label = 'ThetaRho'
    this.commentChar = '#'
  }

  // adds lines mapping given vertices to the theta rho format
  exportCode(vertices) {
    // First, downsample larger lines into smaller ones.
    const maxLength = 2.0
    let subsampledVertices = []
    let previous = undefined
    let next

    for (next = 0; next < vertices.length; next++) {
      if (previous !== undefined) {
        const start = Victor.fromObject(vertices[previous])
        const end = Victor.fromObject(vertices[next])

        const delta = end.clone().subtract(start)
        const deltaSegment = end.clone().subtract(start).normalize().multiply(Victor(maxLength, maxLength))

        // This loads up (start, end].
        for (let step = 0; step < (delta.magnitude() / maxLength) ; step++) {
          subsampledVertices.push(
            new Victor(start.x + step * deltaSegment.x,
                       start.y + step * deltaSegment.y))
        }

      }
      previous = next
    }

    // Add in the end.
    if (previous !== undefined) {
      subsampledVertices.push(vertices[vertices.length - 1])
    }

    // Convert to Theta, Rho
    let trVertices = []
    let previousTheta = 0
    let previousRawTheta = 0

    for (next = 0; next < subsampledVertices.length; ++next) {
      // Normalize the radius
      const rho = Victor.fromObject(subsampledVertices[next]).magnitude() / this.props.maxRadius

      // What is the basic theta for this point?
      let rawTheta = Math.atan2(subsampledVertices[next].x,
                                subsampledVertices[next].y)
      // Convert to [0,2pi]
      rawTheta = (rawTheta + 2.0 * Math.PI) % (2.0 * Math.PI)

      // Compute the difference to the last point.
      let deltaTheta = rawTheta - previousRawTheta

      // Convert to [-pi,pi]
      if (deltaTheta < -Math.PI) {
        deltaTheta += 2.0 * Math.PI
      }
      if (deltaTheta > Math.PI) {
        deltaTheta -= 2.0 * Math.PI
      }

      const theta = previousTheta + deltaTheta
      previousRawTheta = rawTheta
      previousTheta = theta
      trVertices.push(new Victor(theta, rho))
    }

    trVertices.map(thetarho).forEach(line => this.line(line))
  }
}
