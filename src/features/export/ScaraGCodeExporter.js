import GCodeExporter from "./GCodeExporter"
import { subsample, toThetaRho, toScaraGcode } from "@/common/geometry"

export default class ScaraGCodeExporter extends GCodeExporter {
  constructor(props) {
    super(props)
    this.offsetX = 0
    this.offsetY = 0
  }

  // transforms vertices into a SCARA GCode format
  transformVertices(vertices, index, layers) {
    let theta, rawTheta

    if (index == 0) {
      theta = 0
      rawTheta = 0
    } else {
      // preserve previous theta value
      const prevVertices = layers[index - 1].vertices
      const last = prevVertices[prevVertices.length - 1]
      theta = last.theta
      rawTheta = last.rawTheta // already transformed
    }

    vertices = toScaraGcode(
      toThetaRho(
        subsample(vertices, 2.0),
        this.props.maxRadius,
        parseFloat(this.props.polarRhoMax),
        theta,
        rawTheta,
      ),
      parseFloat(this.props.unitsPerCircle),
    )

    return super.transformVertices(vertices, index, layers)
  }
}
