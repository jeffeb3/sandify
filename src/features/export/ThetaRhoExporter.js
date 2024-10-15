import Exporter from "./Exporter"
import { subsample, toThetaRho } from "@/common/geometry"

export default class ThetaRhoExporter extends Exporter {
  constructor(props) {
    super(props)
    this.fileExtension = ".thr"
    this.label = "ThetaRho"
    this.commentChar = "#"
    this.digits = 5
  }

  // collects stats for use in PRE and POST blocks
  collectStats(vertices) {
    return {
      mintheta: Math.min(...vertices.map((v) => v.x)),
      minrho: Math.min(...vertices.map((v) => v.y)),
      maxtheta: Math.max(...vertices.map((v) => v.x)),
      maxrho: Math.max(...vertices.map((v) => v.y)),
      starttheta: vertices[0].x,
      startrho: vertices[0].y,
      endtheta: vertices[vertices.length - 1].x,
      endrho: vertices[vertices.length - 1].y,
    }
  }

  // transforms vertices into a theta-rho format
  transformVertices(vertices) {
    // downsample larger lines into smaller ones
    const maxLength = 2.0
    const subsampledVertices = subsample(vertices, maxLength)

    // convert to theta, rho
    return toThetaRho(
      subsampledVertices,
      this.props.maxRadius,
      parseFloat(this.props.polarRhoMax),
    )
  }

  // provides a theta-rho machine instruction for a given vertex
  code(vertex) {
    return (
      "" + vertex.x.toFixed(this.digits) + " " + vertex.y.toFixed(this.digits)
    )
  }
}
