import Effect from "./Effect"
import { offset, rotate } from "@/common/geometry"

const options = {
  trackRadius: {
    title: "Track radius",
  },
  trackRotations: {
    title: "Track rotations",
  },
  trackSpiralEnabled: {
    title: "Spiral track",
    type: "checkbox",
  },
  trackSpiralRadius: {
    title: "Spiral radius",
    isVisible: (layer, state) => {
      return state.trackSpiralEnabled
    },
  },
}

export default class Track extends Effect {
  constructor() {
    super("track")
    this.label = "Track"
  }

  canChangeSize(state) {
    return false
  }

  canRotate(state) {
    return false
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        trackRadius: 10,
        trackRotations: 1,
        trackSpiralEnabled: false,
        trackSpiralRadius: 50.0,
      },
    }
  }

  // TODO: replace with bounds for transformer
  /*getVertices(state) {
    return circle(25)
  }*/

  getVertices(effect, layer, vertices) {
    let outputVertices = []

    for (var j = 0; j < vertices.length; j++) {
      let transformedVertex = vertices[j]

      // Fraction of the complete track
      const completeFraction = j / vertices.length

      // Angle (in degrees) around the track
      const angleDeg = completeFraction * effect.trackRotations * 360.0

      // Amount of distance to add to the offset
      let spiralValue = 0.0
      if (effect.trackSpiralEnabled) {
        spiralValue =
          (effect.trackSpiralRadius - effect.trackRadius) * completeFraction
      }

      transformedVertex = rotate(
        offset(transformedVertex, effect.trackRadius + spiralValue, 0.0),
        angleDeg,
      )

      outputVertices.push(transformedVertex)
    }

    return outputVertices
  }

  getOptions() {
    return options
  }
}
