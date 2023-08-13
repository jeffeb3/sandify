import Victor from "victor"
import * as d3Fisheye from "d3-fisheye"
import { circle } from "@/common/geometry"
import Effect from "./Effect"

const options = {
  fisheyeDistortion: {
    title: "Distortion",
    min: -2,
    max: 40,
    step: 1,
  },
  x: {
    title: "X",
  },
  y: {
    title: "Y",
  },
}

export default class Fisheye extends Effect {
  constructor() {
    super("fisheye")
    this.label = "Fisheye"
    this.canMove = true
  }

  canChangeSize(state) {
    return true
  }

  canChangeHeight(state) {
    return false
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        fisheyeDistortion: 3,
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      },
    }
  }

  getSelectionVertices(effect) {
    console.log("here")
    return circle(effect.width / 2)
  }

  getVertices(effect, layer, vertices) {
    const radius = effect.width / 2
    const fisheye = d3Fisheye
      .radial()
      .radius(radius)
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
