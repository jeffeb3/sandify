import Exporter from './Exporter'
import { subsample, toThetaRho, toScaraGcode } from '../../common/geometry'

export default class GCodeExporter extends Exporter {
  constructor(props) {
    super(props)
    this.fileExtension = '.gcode'
    this.label = 'Gcode'
    this.commentChar = ';'
  }

  exportCode(vertices) {
    vertices.map(this.gcode).forEach(line => this.line(line))
  }

  // computes vertices compatible with the gcode format, and replaces
  // placeholder variables in pre/post blocks.
  computeOutputVertices(vertices) {

    if (this.props.scaraGcode) {
      // First, downsample larger lines into smaller ones.
      const maxLength = 2.0
      const subsampledVertices = subsample(vertices, maxLength)

      // Convert to theta, rho
      vertices = toThetaRho(subsampledVertices, this.props.maxRadius, parseFloat(this.props.polarRhoMax))

      vertices = toScaraGcode(vertices)
    }

    // Collect some statistics about these vertices.
    let minx = 1e9
    let miny = 1e9
    let maxx = -1e9
    let maxy = -1e9
    this.vertices = vertices.map(vertex => {
      let offsetX = this.props.offsetX
      let offsetY = this.props.offsetY
      if (this.props.scaraGcode) {
        offsetX = 0
        offsetY = 0
      }

      const x = vertex.x + offsetX
      const y = vertex.y + offsetY
      minx = Math.min(x, minx)
      miny = Math.min(y, miny)
      maxx = Math.max(x, maxx)
      maxy = Math.max(y, maxy)

      return {
        ...vertex,
        x: x,
        y: y,
      }
    })
    let startx = this.vertices[0].x
    let starty = this.vertices[0].y
    let endx = this.vertices[this.vertices.length-1].x
    let endy = this.vertices[this.vertices.length-1].y

    // Replace pre/post placeholder variables
    this.pre  =  this.pre.replace(/{startx}/gi, startx.toFixed(3))
    this.pre  =  this.pre.replace(/{starty}/gi, starty.toFixed(3))
    this.pre  =  this.pre.replace(/{endx}/gi,   endx.toFixed(3))
    this.pre  =  this.pre.replace(/{endy}/gi,   endy.toFixed(3))
    this.pre  =  this.pre.replace(/{minx}/gi,   minx.toFixed(3))
    this.pre  =  this.pre.replace(/{miny}/gi,   miny.toFixed(3))
    this.pre  =  this.pre.replace(/{maxx}/gi,   maxx.toFixed(3))
    this.pre  =  this.pre.replace(/{maxy}/gi,   maxy.toFixed(3))
    this.post = this.post.replace(/{startx}/gi, startx.toFixed(3))
    this.post = this.post.replace(/{starty}/gi, starty.toFixed(3))
    this.post = this.post.replace(/{endx}/gi,   endx.toFixed(3))
    this.post = this.post.replace(/{endy}/gi,   endy.toFixed(3))
    this.post = this.post.replace(/{minx}/gi,   minx.toFixed(3))
    this.post = this.post.replace(/{miny}/gi,   miny.toFixed(3))
    this.post = this.post.replace(/{maxx}/gi,   maxx.toFixed(3))
    this.post = this.post.replace(/{maxy}/gi,   maxy.toFixed(3))
  }

  gcode(vertex) {
    let command = 'G01' +
      ' X' + vertex.x.toFixed(3) +
      ' Y' + vertex.y.toFixed(3)
    return command
  }
}
