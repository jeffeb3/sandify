import Effect from "./Effect"
import Victor from "victor"
import {
  circle,
  resizeVertices,
  cloneVertices,
  centerOnOrigin,
  toLocalSpace,
  toWorldSpace,
} from "@/common/geometry"
import { traceBoundary } from "@/common/boundary"
import PolarMachine from "@/features/machines/PolarMachine"
import RectMachine from "@/features/machines/RectMachine"
import PolarInvertedMachine from "@/features/machines/PolarInvertedMachine"
import RectInvertedMachine from "@/features/machines/RectInvertedMachine"
import PolygonMachine from "@/features/machines/PolygonMachine"
import PolygonInvertedMachine from "@/features/machines/PolygonInvertedMachine"

const machineMap = {
  rectangle: { normal: RectMachine, inverted: RectInvertedMachine },
  circle: { normal: PolarMachine, inverted: PolarInvertedMachine },
  layer: { normal: PolygonMachine, inverted: PolygonInvertedMachine },
}

const getMachineClass = (maskMachine, invert) =>
  machineMap[maskMachine][invert ? "inverted" : "normal"]

const options = {
  maskMachine: {
    title: "Mask shape",
    type: "togglebutton",
    choices: ["rectangle", "circle", "layer"],
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

        // Clear layer selection when switching away from layer mode
        if (changes.maskMachine !== "layer") {
          changes.maskLayerId = null
        }
      }

      return changes
    },
  },
  maskLayerId: {
    title: "Source layer",
    type: "layerSelect",
    isVisible: (model, state) => state.maskMachine === "layer",
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
    return state.maskMachine === "rectangle" || state.maskMachine === "layer"
  }

  canChangeAspectRatio(state) {
    return state.maskMachine === "rectangle"
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
        maskLayerId: null,
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

  getVertices(effect, layer, vertices, maskSourceVertices) {
    // Layer-based masking
    if (effect.maskMachine === "layer") {
      // No valid source layer - pass through unchanged
      if (!maskSourceVertices || maskSourceVertices.length < 3) {
        return vertices
      }

      // Trace boundary first (handles self-intersecting shapes), then center, scale, and rotate
      const boundary = traceBoundary(maskSourceVertices)
      const centeredMask = centerOnOrigin(cloneVertices(boundary))
      const scaledMask = resizeVertices(
        cloneVertices(centeredMask),
        effect.width,
        effect.height,
        true,
      )

      vertices = vertices.map((vertex) => {
        return toLocalSpace(vertex, effect.x, effect.y, effect.rotation)
      })

      if (!effect.dragging) {
        const MachineClass = getMachineClass("layer", effect.maskInvert)
        const machine = new MachineClass(
          { minimizeMoves: effect.maskMinimizeMoves },
          scaledMask,
        )

        vertices = machine.polish(vertices, { border: effect.maskBorder })
      }

      return vertices.map((vertex) => {
        return toWorldSpace(vertex, effect.x, effect.y, effect.rotation)
      })
    }

    // Standard rectangle/circle masking
    vertices = vertices.map((vertex) => {
      return toLocalSpace(vertex, effect.x, effect.y, effect.rotation)
    })

    if (!effect.dragging) {
      const MachineClass = getMachineClass(
        effect.maskMachine,
        effect.maskInvert,
      )
      const machine = new MachineClass({
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
      return toWorldSpace(vertex, effect.x, effect.y, effect.rotation)
    })
  }
}
