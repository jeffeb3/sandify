import Victor from "victor"
import Effect from "./Effect"
import { circle } from "@/common/geometry"
import * as d3Fisheye from "d3-fisheye"

const options = {
  fisheyeDistortion: {
    title: "Distortion",
    min: -2,
    max: 40,
    step: 0.1,
  },
}

export default class Fisheye extends Effect {
  constructor() {
    super("fisheye")
    this.label = "Fisheye"
    this.startingWidth = 100
    this.startingHeight = 100
  }

  canRotate(state) {
    return false
  }

  canChangeHeight(state) {
    return false
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        fisheyeDistortion: 3,
      },
    }
  }

  getVertices(state) {
    return circle(this.startingWidth / 2)
  }

  getVertices(effect, layer, vertices) {
    const fisheye = d3Fisheye
      .radial()
      .radius(effect.width / 2)
      .distortion(effect.fisheyeDistortion / 2)
    fisheye.focus([effect.x, effect.y])

    return vertices.map((vertex) => {
      const warped = fisheye([vertex.x, vertex.y])
      return new Victor(warped[0], warped[1])
    })
  }

  getOptions() {
    return options
  }
}
