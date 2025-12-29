import Effect from "./Effect"
import Victor from "victor"
import {
  scale,
  rotate,
  centerOnOrigin,
  cloneVertex,
  subsample,
} from "@/common/geometry"
import { evaluate } from "mathjs"
import i18n from "@/i18n"

const options = {
  numLoops: {
    title: i18n.t("effects.loop.numberOfLoops"),
    min: 1,
    randomMin: 3,
    randomMax: 8,
  },
  transformMethod: {
    title: i18n.t("effects.loop.whenTransformingShape"),
    type: "togglebutton",
    choices: [
      {"title": i18n.t("effects.loop.smear"), "value": "smear"}, 
      {"title": i18n.t("effects.loop.intact"), "value": "intact"}
    ],
  },
  growEnabled: {
    title: i18n.t("effects.loop.scale"),
    type: "checkbox",
  },
  growValue: {
    title: i18n.t("effects.loop.scalePlusMinus"),
    isVisible: (layer, state) => {
      return state.growEnabled
    },
  },
  growMethod: {
    title: i18n.t("effects.loop.scaleBy"),
    type: "togglebutton",
    choices: [
      {"title": i18n.t("effects.loop.constant"), "value": "constant"}, 
      {"title": i18n.t("effects.loop.function"), "value": "function"}
    ],
    isVisible: (layer, state) => {
      return state.growEnabled
    },
  },
  growMathInput: {
    title: i18n.t("effects.loop.scaleFunction"),
    type: "text",
    delayKey: "growMath",
    isVisible: (layer, state) => {
      return state.growMethod === "function"
    },
  },
  growMath: {
    isVisible: (layer, state) => {
      return false
    },
    type: "hidden",
  },
  spinEnabled: {
    title: i18n.t("effects.loop.spin"),
    type: "checkbox",
  },
  spinValue: {
    title: i18n.t("effects.loop.spinPlusMinus"),
    step: 0.1,
    isVisible: (layer, state) => {
      return state.spinEnabled
    },
    randomMax: 10,
  },
  spinMethod: {
    title: i18n.t("effects.loop.spinBy"),
    type: "togglebutton",
    choices: [
      {"title": i18n.t("effects.loop.constant"), "value": "constant"}, 
      {"title": i18n.t("effects.loop.function"), "value": "function"}
    ],
    isVisible: (layer, state) => {
      return state.spinEnabled
    },
  },
  spinMathInput: {
    title: i18n.t("effects.loop.spinFunction"),
    type: "text",
    delayKey: "spinMath",
    isVisible: (layer, state) => {
      return state.spinMethod === "function"
    },
  },
  spinMath: {
    isVisible: (layer, state) => {
      return false
    },
    type: "hidden",
  },
  spinSwitchbacks: {
    title: i18n.t("effects.loop.switchbacks"),
    isVisible: (layer, state) => {
      return state.spinEnabled && state.spinMethod === "constant"
    },
    randomMax: 4,
  },
}

export default class Loop extends Effect {
  constructor() {
    super("loop")
    this.label = i18n.t("effects.loop.loop")
  }

  canRotate(state) {
    return false
  }

  canChangeSize(state) {
    return false
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        // loop Options
        transformMethod: "smear",
        numLoops: 10,

        // grow options
        growEnabled: true,
        growValue: 25,
        growMethod: "constant",
        growMathInput: "i+cos(i/2)",
        growMath: "i+cos(i/2)",

        // spin options
        spinEnabled: false,
        spinValue: 2,
        spinMethod: "constant",
        spinMathInput: "10*sin(i/4)",
        spinMath: "10*sin(i/4)",
        spinSwitchbacks: 0,
      },
    }
  }

  getVertices(effect, layer, vertices) {
    centerOnOrigin(vertices, [new Victor(0, 0), new Victor(0, 0)])

    // weird case where user has turned off both grow and spin
    if (!effect.growEnabled && !effect.spinEnabled) {
      return vertices
    }

    // remove first point if we are smearing
    if (effect.transformMethod === "smear") {
      vertices.pop()
    }

    const outputVertices = []
    let numLoops = effect.numLoops
    let fractionalLength = vertices.length
    const remainder = numLoops - (numLoops = Math.floor(numLoops))

    if (remainder > 0) {
      // ensure shapes with fewer vertices like polygon are subsampled to produce an
      // accurate fractional loop
      vertices = subsample(vertices, 2.0)
      fractionalLength = Math.floor(vertices.length * remainder)
      numLoops = numLoops + 1
    }

    for (var i = 0; i < numLoops; i++) {
      const length = i == numLoops - 1 ? fractionalLength : vertices.length

      for (let j = 0; j < length; j++) {
        let vertex = cloneVertex(vertices[j])
        let amount =
          effect.transformMethod === "smear" ? i + j / vertices.length : i

        if (effect.growEnabled) {
          let growAmount = 100

          if (effect.growMethod === "function") {
            try {
              growAmount =
                effect.growValue * evaluate(effect.growMath, { i: amount })
            } catch (err) {
              console.log("Error parsing grow function: " + err)
              growAmount = 200
            }
          } else {
            growAmount = 100.0 + effect.growValue * amount
          }

          // Actually do the growing
          vertex = scale(vertex, growAmount / 100.0)
        }

        if (effect.spinEnabled) {
          let spinAmount = 0

          if (effect.spinMethod === "function") {
            try {
              spinAmount =
                effect.spinValue * evaluate(effect.spinMath, { i: amount })
            } catch (err) {
              console.log("Error parsing spin function: " + err)
              spinAmount = 0
            }
          } else {
            const loopPeriod =
              effect.numLoops / (parseInt(effect.spinSwitchbacks) + 1)
            const stage = amount / loopPeriod
            const direction = stage % 2 < 1 ? 1.0 : -1.0

            spinAmount = direction * (amount % loopPeriod) * effect.spinValue
            // Add in the amount it goes positive to the negatives, so they start at the same place.
            if (direction < 0.0) {
              spinAmount += loopPeriod * effect.spinValue
            }
          }
          vertex = rotate(vertex, spinAmount)
        }

        outputVertices.push(vertex)
      }
    }

    return outputVertices
  }

  getOptions() {
    return options
  }
}
