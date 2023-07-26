import Exporter from "./Exporter"
import { subsample, toThetaRho } from "@/common/geometry"

function thetarho(vertex) {
  return "" + vertex.x.toFixed(5) + " " + vertex.y.toFixed(5)
}

export default class ThetaRhoExporter extends Exporter {
  constructor(props) {
    super(props)
    this.fileExtension = ".thr"
    this.label = "ThetaRho"
    this.commentChar = "#"
  }

  // computes vertices compatible with the theta rho format, and replaces
  // placeholder variables in pre/post blocks.
  computeOutputVertices(vertices) {
    // First, downsample larger lines into smaller ones.
    const maxLength = 2.0
    const subsampledVertices = subsample(vertices, maxLength)

    // Convert to theta, rho
    this.vertices = toThetaRho(
      subsampledVertices,
      this.props.maxRadius,
      parseFloat(this.props.polarRhoMax),
    )

    let starttheta = this.vertices[0].x
    let startrho = this.vertices[0].y
    let endtheta = this.vertices[this.vertices.length - 1].x
    let endrho = this.vertices[this.vertices.length - 1].y
    let mintheta = 1e9
    let minrho = 1e9
    let maxtheta = -1e9
    let maxrho = -1e9

    this.vertices.forEach((thetarho) => {
      minrho = Math.min(thetarho.y, minrho)
      maxrho = Math.max(thetarho.y, maxrho)
      mintheta = Math.min(thetarho.x, mintheta)
      maxtheta = Math.max(thetarho.x, maxtheta)
    })

    // Replace pre/post placeholder variables
    this.pre = this.pre.replace(/{starttheta}/gi, starttheta.toFixed(3))
    this.pre = this.pre.replace(/{startrho}/gi, startrho.toFixed(3))
    this.pre = this.pre.replace(/{endtheta}/gi, endtheta.toFixed(3))
    this.pre = this.pre.replace(/{endrho}/gi, endrho.toFixed(3))
    this.pre = this.pre.replace(/{mintheta}/gi, mintheta.toFixed(3))
    this.pre = this.pre.replace(/{minrho}/gi, minrho.toFixed(3))
    this.pre = this.pre.replace(/{maxtheta}/gi, maxtheta.toFixed(3))
    this.pre = this.pre.replace(/{maxrho}/gi, maxrho.toFixed(3))
    this.post = this.post.replace(/{starttheta}/gi, starttheta.toFixed(3))
    this.post = this.post.replace(/{startrho}/gi, startrho.toFixed(3))
    this.post = this.post.replace(/{endtheta}/gi, endtheta.toFixed(3))
    this.post = this.post.replace(/{endrho}/gi, endrho.toFixed(3))
    this.post = this.post.replace(/{mintheta}/gi, mintheta.toFixed(3))
    this.post = this.post.replace(/{minrho}/gi, minrho.toFixed(3))
    this.post = this.post.replace(/{maxtheta}/gi, maxtheta.toFixed(3))
    this.post = this.post.replace(/{maxrho}/gi, maxrho.toFixed(3))
  }

  exportCode(vertices) {
    vertices.map(thetarho).forEach((line) => this.line(line))
  }
}
