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
  computeOutputVertices(vertices) {
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
    this.vertices = []
    let previousTheta = 0
    let previousRawTheta = 0


    let mintheta = 1e9
    let minrho   = 1e9
    let maxtheta = -1e9
    let maxrho   = -1e9
    for (next = 0; next < subsampledVertices.length; ++next) {
      // Normalize the radius
      const rho = Victor.fromObject(subsampledVertices[next]).magnitude() / this.props.maxRadius
      minrho = Math.min(rho, minrho)
      maxrho = Math.max(rho, maxrho)

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
      mintheta = Math.min(theta, mintheta)
      maxtheta = Math.max(theta, maxtheta)
      previousRawTheta = rawTheta
      previousTheta = theta
      this.vertices.push(new Victor(theta, rho))
    }
    let starttheta = this.vertices[0].x
    let startrho   = this.vertices[0].y
    let endtheta   = this.vertices[this.vertices.length-1].x
    let endrho     = this.vertices[this.vertices.length-1].y

    // Replace these strings.
    this.pre  =  this.pre.replace(/{starttheta}/gi, starttheta.toFixed(3))
    this.pre  =  this.pre.replace(/{startrho}/gi,   startrho.toFixed(3))
    this.pre  =  this.pre.replace(/{endtheta}/gi,   endtheta.toFixed(3))
    this.pre  =  this.pre.replace(/{endrho}/gi,     endrho.toFixed(3))
    this.pre  =  this.pre.replace(/{mintheta}/gi,   mintheta.toFixed(3))
    this.pre  =  this.pre.replace(/{minrho}/gi,     minrho.toFixed(3))
    this.pre  =  this.pre.replace(/{maxtheta}/gi,   maxtheta.toFixed(3))
    this.pre  =  this.pre.replace(/{maxrho}/gi,     maxrho.toFixed(3))
    this.post = this.post.replace(/{starttheta}/gi, starttheta.toFixed(3))
    this.post = this.post.replace(/{startrho}/gi,   startrho.toFixed(3))
    this.post = this.post.replace(/{endtheta}/gi,   endtheta.toFixed(3))
    this.post = this.post.replace(/{endrho}/gi,     endrho.toFixed(3))
    this.post = this.post.replace(/{mintheta}/gi,   mintheta.toFixed(3))
    this.post = this.post.replace(/{minrho}/gi,     minrho.toFixed(3))
    this.post = this.post.replace(/{maxtheta}/gi,   maxtheta.toFixed(3))
    this.post = this.post.replace(/{maxrho}/gi,     maxrho.toFixed(3))
  }

  exportCode(vertices) {
    vertices.map(thetarho).forEach(line => this.line(line))
  }
}
