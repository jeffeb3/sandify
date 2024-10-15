import Exporter from "./Exporter"

export default class GCodeExporter extends Exporter {
  constructor(props) {
    super(props)
    this.fileExtension = ".gcode"
    this.label = "Gcode"
    this.commentChar = ";"
    this.offsetX = this.props.offsetX
    this.offsetY = this.props.offsetY
  }

  // collects stats for use in PRE and POST blocks
  collectStats(vertices) {
    return {
      minx: Math.min(...vertices.map((v) => v.x)),
      miny: Math.min(...vertices.map((v) => v.y)),
      maxx: Math.max(...vertices.map((v) => v.x)),
      maxy: Math.max(...vertices.map((v) => v.y)),
      startx: vertices[0].x,
      starty: vertices[0].y,
      endx: vertices[vertices.length - 1].x,
      endy: vertices[vertices.length - 1].y,
    }
  }

  // transforms vertices to be compatible with the GCode format
  transformVertices(vertices) {
    return vertices.map((vertex) => {
      return {
        ...vertex,
        x: vertex.x + this.offsetX,
        y: vertex.y + this.offsetY,
      }
    })
  }

  // provides a GCode machine instruction for a given vertex
  code(vertex) {
    return (
      "G1" +
      " X" +
      vertex.x.toFixed(this.digits) +
      " Y" +
      vertex.y.toFixed(this.digits)
    )
  }
}
