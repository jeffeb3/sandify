import Effect from "./Effect"
import Victor from "victor"
import { rotate, offset, circle } from "@/common/geometry"
import PolarMachine from "@/features/machines/PolarMachine"
import RectMachine from "@/features/machines/RectMachine"
import PolarInvertedMachine from "@/features/machines/PolarInvertedMachine"
import RectInvertedMachine from "@/features/machines/RectInvertedMachine"

const options = {
  maskMachine: {
    title: "Mask shape",
    type: "togglebutton",
    choices: ["rectangle", "circle"],
    onChange: (model, changes, state) => {
      if (changes.maskMachine) {
        if (changes.maskMachine === "circle") {
          changes.rotation = 0

          const size = Math.max(state.width, state.height)
          changes.height = size
          changes.width = size
          changes.maintainAspectRatio = true
        } else {
          changes.maintainAspectRatio = false
        }
      }

      return changes
    },
  },
  maskMinimizeMoves: {
    title: "Minimize perimeter moves",
    type: "checkbox",
  },
  maskInvert: {
    title: "Invert",
    type: "checkbox",
  },
  maskBorder: {
    title: "Draw border",
    type: "checkbox",
  },
}

export default class Mask extends Effect {
  constructor() {
    super("mask")
    this.label = "Mask"
    this.randomizable = false
  }

  canMove(state) {
    return true
  }

  canRotate(state) {
    return state.maskMachine != "circle"
  }

  canChangeAspectRatio(state) {
    return state.maskMachine != "circle"
  }

  canChangeSize(state) {
    return true
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        width: 100,
        height: 100,
        maskMinimizeMoves: false,
        maskMachine: "rectangle",
        maskInvert: false,
        maskBorder: false,
      },
    }
  }

  getOptions() {
    return options
  }

  getSelectionVertices(effect) {
    const { width, height } = effect

    if (effect.maskMachine === "circle") {
      return circle(width / 2)
    } else {
      return [
        new Victor(-width / 2, height / 2),
        new Victor(width / 2, height / 2),
        new Victor(width / 2, -height / 2),
        new Victor(-width / 2, -height / 2),
        new Victor(-width / 2, height / 2),
      ]
    }
  }

  getVertices(effect, layer, vertices) {
    vertices = vertices.map((vertex) => {
      return rotate(offset(vertex, -effect.x, -effect.y), effect.rotation)
    })

    if (!effect.dragging) {
      const machineClass =
        effect.maskMachine === "circle"
          ? effect.maskInvert
            ? PolarInvertedMachine
            : PolarMachine
          : effect.maskInvert
            ? RectInvertedMachine
            : RectMachine

      const machine = new machineClass({
        minX: 0,
        maxX: effect.width,
        minY: 0,
        maxY: effect.height,
        minimizeMoves: effect.maskMinimizeMoves,
        maxRadius: effect.width / 2,
        mask: true,
      })
      vertices = machine.polish(vertices, { border: effect.maskBorder })
    }

    return vertices.map((vertex) => {
      return offset(rotate(vertex, -effect.rotation), effect.x, effect.y)
    })
  }
}
