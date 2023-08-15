import Effect from "./Effect"
import { rotate, offset } from "@/common/geometry"
import PolarMachine from "@/features/machine/PolarMachine"
import RectMachine from "@/features/machine/RectMachine"
import PolarInvertedMachine from "@/features/machine/PolarInvertedMachine"
import RectInvertedMachine from "@/features/machine/RectInvertedMachine"

const options = {
  maskMachine: {
    title: "Mask shape",
    type: "togglebutton",
    choices: ["rectangle", "circle"],
    onChange: (model, changes, state) => {
      if (changes.maskMachine === "circle") {
        changes.rotation = 0

        const size = Math.min(changes.width, changes.height)
        changes.height = size
        changes.width = size
      }

      return changes
    },
  },
  maskMinimizeMoves: {
    title: "Try to minimize perimeter moves",
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
    this.canMove = true
    this.label = "Mask"
  }

  canRotate(state) {
    return state.maskMachine != "circle"
  }

  canChangeHeight(state) {
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
        x: 0,
        y: 0,
        rotation: 0,
        maskMinimizeMoves: false,
        maskMachine: "rectangle",
        maskBorder: false,
        maskInvert: false,
      },
    }
  }

  getOptions() {
    return options
  }

  // TODO: replace with bounds for transformer
  /*getVertices(state) {
    const width = state.shape.width
    const height = state.shape.height

    if (state.shape.dragging && state.shape.maskMachine === "circle") {
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
  }*/

  getVertices(effect, layer, vertices) {
    vertices = vertices.map((vertex) => {
      return rotate(offset(vertex, -effect.x, -effect.y), effect.rotation)
    })

    if (!layer.dragging && !effect.dragging) {
      const machineClass =
        effect.maskMachine === "circle"
          ? effect.maskInvert
            ? PolarInvertedMachine
            : PolarMachine
          : effect.maskInvert
          ? RectInvertedMachine
          : RectMachine

      const machine = new machineClass(
        vertices,
        {
          minX: 0,
          maxX: effect.width,
          minY: 0,
          maxY: effect.height,
          minimizeMoves: effect.maskMinimizeMoves,
          maxRadius: effect.width / 2,
          perimeterConstant: effect.maskPerimeterConstant,
          mask: true,
        },
        { border: effect.maskBorder },
      )
      vertices = machine.polish().vertices
    }

    return vertices.map((vertex) => {
      return offset(rotate(vertex, -effect.rotation), effect.x, effect.y)
    })
  }
}
