import GCodeExporter from "./GCodeExporter"
import { subsample, toThetaRho, toScaraGcode } from "@/common/geometry"

export default class ScaraGCodeExporter extends GCodeExporter {
  constructor(props) {
    super(props)
    this.offsetX = 0
    this.offsetY = 0
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

  // transforms vertices into a SCARA GCode format
  transformVertices(vertices) {
    vertices = toScaraGcode(
      toThetaRho(
        subsample(vertices, 2.0),
        this.props.maxRadius,
        parseFloat(this.props.polarRhoMax),
      ),
      parseFloat(this.props.unitsPerCircle),
    )

    return super.transformVertices(vertices)
  }
}
