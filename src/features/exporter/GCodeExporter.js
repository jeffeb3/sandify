import Exporter from './Exporter'

export default class GCodeExporter extends Exporter {
  constructor(props) {
    super(props)
    this.fileExtension = '.gcode'
    this.label = 'Gcode'
    this.commentChar = ';'
  }

  exportCode() {
    var centeredVertices = this.props.vertices.map( (vertex) => {
      return {
        ...vertex,
        x: vertex.x + this.props.offsetX,
        y: vertex.y + this.props.offsetY,
      }
    })

    centeredVertices.map(this.gcode).forEach(line => this.line(line))
  }

  gcode(vertex) {
    let command = 'G01' +
      ' X' + vertex.x.toFixed(3) +
      ' Y' + vertex.y.toFixed(3)

    if (vertex.speed > 0.0) {
      command += ' F' + vertex.f
    }

    return command
  }
}
