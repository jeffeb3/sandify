import { getShape } from "@/features/shapes/shapeFactory"
import EffectLayer from "@/features/effects/EffectLayer"
import { resizeVertices, centerOnOrigin } from "@/common/geometry"
import { roundP } from "@/common/util"

export const layerOptions = {
  name: {
    title: "Name",
    type: "text",
  },
  x: {
    title: "X",
    inline: true,
    isVisible: (model, state) => {
      return model.canMove(state)
    },
  },
  y: {
    title: "Y",
    inline: true,
    isVisible: (model, state) => {
      return model.canMove(state)
    },
  },
  width: {
    title: "W",
    min: 1,
    inline: true,
    isVisible: (model, state) => {
      return model.canChangeSize(state)
    },
    onChange: (model, changes, state) => {
      if (changes.width === "" || changes.width <= 0) {
        changes.width = 1
      }
      if (state.maintainAspectRatio) {
        changes.height = roundP(changes.width / state.aspectRatio, 2)
      } else {
        changes.aspectRatio = changes.width / state.height
      }
      return changes
    },
  },
  height: {
    title: "H",
    min: 1,
    inline: true,
    onChange: (model, changes, state) => {
      if (changes.height === "" || changes.height <= 0) {
        changes.height = 1
      }
      if (state.maintainAspectRatio) {
        changes.width = roundP(changes.height * state.aspectRatio, 2)
      } else {
        changes.aspectRatio = state.width / changes.height
      }
      return changes
    },
  },
  maintainAspectRatio: {
    title: "Lock aspect ratio",
    type: "checkbox",
  },
  rotation: {
    title: "Rotate (degrees)",
    inline: true,
    isVisible: (model, state) => {
      return model.canRotate(state)
    },
  },
  connectionMethod: {
    title: "Connect to next layer",
    type: "togglebutton",
    choices: ["line", "along perimeter"],
  },
}

export default class Layer {
  constructor(type) {
    this.model = getShape(type)
  }

  getInitialState(props) {
    const dimensions = this.model.initialDimensions(props)
    const { width, height, aspectRatio } = dimensions

    return {
      ...this.model.getInitialState(props),
      ...{
        type: this.model.type,
        connectionMethod: "line",
        x: 0.0,
        y: 0.0,
        width,
        height,
        aspectRatio,
        rotation: 0,
        visible: true,
        name: this.model.label,
        effectIds: [],
      },
    }
  }

  getOptions() {
    return layerOptions
  }

  // returns an array of Victor vertices
  getVertices({ layer, effects, machine, options = {} }) {
    const layerState = { shape: layer, machine }

    this.state = layer
    this.vertices = this.model.getCachedVertices(layerState)

    if (this.model.autosize) {
      this.resize()
      centerOnOrigin(this.vertices)
    }

    this.applyEffects(effects)
    this.transform()
    this.vertices = this.model.finalizeVertices(
      this.vertices,
      layerState,
      options,
    )

    return this.vertices
  }

  resize() {
    const { width, height, aspectRatio } = this.state

    if (this.model.stretch) {
      // special case for shapes that always stretch to fit their dimensions (e.g., font shapes)
      this.vertices = resizeVertices(this.vertices, width, height, true, 1)
    } else {
      this.vertices = resizeVertices(
        this.vertices,
        width,
        height,
        false,
        aspectRatio,
      )
    }
  }

  transform() {
    const { x, y, rotation } = this.state

    this.vertices.forEach((vertex) => {
      vertex.rotateDeg(-rotation)
      vertex.addX({ x: x || 0 }).addY({ y: y || 0 })
    })
  }

  applyEffects(effects) {
    effects.forEach((effect) => {
      const effectLayer = new EffectLayer(effect.type)
      this.vertices = effectLayer.getVertices(effect, this.state, this.vertices)
    })
  }

  // used to preserve hidden attributes when loading from a file
  getHiddenAttrs() {
    return ["imageId"]
  }
}
