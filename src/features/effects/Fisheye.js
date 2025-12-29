import Victor from "victor"
import * as d3Fisheye from "d3-fisheye"
import { circle, subsample } from "@/common/geometry"
import Effect from "./Effect"
import i18n from "@/i18n"

const options = () => ({
  fisheyeSubsample: {
    title: i18n.t("effects.fisheye.subsamplePoints"),
    type: "checkbox",
  },
  fisheyeDistortion: {
    title: i18n.t("effects.fisheye.distortion"),
    min: -2,
    max: 40,
    step: 1,
  },
})

export default class Fisheye extends Effect {
  constructor() {
    super("fisheye")
    this.label = i18n.t("effects.fisheye.fisheye")
  }

  canMove(state) {
    return true
  }

  canChangeSize(state) {
    return true
  }

  canChangeAspectRatio(state) {
    return false
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        fisheyeDistortion: 3,
        fisheyeSubsample: true,
        width: 100,
        height: 100,
        maintainAspectRatio: true,
      },
    }
  }

  getSelectionVertices(effect) {
    return circle(effect.width / 2)
  }

  getVertices(effect, layer, vertices) {
    if (effect.fisheyeSubsample) {
      vertices = subsample(vertices, 2.0)
    }

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
    return options()
  }
}
