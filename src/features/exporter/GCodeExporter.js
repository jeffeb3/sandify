import Exporter from './Exporter'

export default class GCodeExporter extends Exporter {
  constructor(props) {
    super(props)
    this.fileExtension = '.gcode'
    this.label = 'Gcode'
    this.commentChar = ';'
  }

  exportCode(vertices) {
    var centeredVertices = vertices.map( (vertex) => {
      return {
        ...vertex,
        x: vertex.x + this.props.offsetX,
        y: vertex.y + this.props.offsetY,
      }
    })

    centeredVertices.map(this.gcode).forEach(line => this.line(line))
  }

  variableReplace(vertices) {
    // Collect some statistics about these vertices.
    let startx = vertices[0].x + this.props.offsetX
    let starty = vertices[0].y + this.props.offsetY
    let endx = vertices[vertices.length-1].x + this.props.offsetX
    let endy = vertices[vertices.length-1].y + this.props.offsetY
    let minx = 1e9
    let miny = 1e9
    let maxx = -1e9
    let maxy = -1e9
    vertices.forEach( (vertex) => {
      minx = Math.min(vertex.x + this.props.offsetX, minx)
      miny = Math.min(vertex.y + this.props.offsetY, miny)
      maxx = Math.max(vertex.x + this.props.offsetX, maxx)
      maxy = Math.max(vertex.y + this.props.offsetY, maxy)
    })

    // Replace these strings.
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
