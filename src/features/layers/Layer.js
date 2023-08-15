import { getShapeFromType } from "@/features/shapes/factory"
import EffectLayer from "@/features/effects/EffectLayer"
import { resizeVertices, centerOnOrigin, findBounds } from "@/common/geometry"

export const layerOptions = {
  name: {
    title: "Name",
    type: "text",
  },
  x: {
    title: "X",
    inline: true,
    isVisible: (model, state) => {
      return model.canMove
    },
  },
  y: {
    title: "Y",
    inline: true,
    isVisible: (model, state) => {
      return model.canMove
    },
  },
  width: {
    title: (model, state) => {
      return model.canChangeHeight(state) ? "W" : "S"
    },
    min: 1,
    inline: true,
    isVisible: (model, state) => {
      return model.canChangeSize(state)
    },
    onChange: (model, changes, state) => {
      if (!model.canChangeHeight(state)) {
        changes.height = changes.width
      }
      return changes
    },
  },
  height: {
    title: "H",
    min: 1,
    inline: true,
    isVisible: (model, state) => {
      return model.canChangeSize(state) && model.canChangeHeight(state)
    },
  },
  reverse: {
    title: "Reverse path",
    type: "checkbox",
    isVisible: (model, state) => {
      return !model.effect
    },
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
    this.model = getShapeFromType(type)
  }

  getInitialState(props) {
    const dimensions = this.model.initialDimensions(props)

    return {
      ...this.model.getInitialState(props),
      ...{
        type: this.model.type,
        connectionMethod: "line",
        x: 0.0,
        y: 0.0,
        width: dimensions.width,
        height: dimensions.height,
        rotation: 0,
        reverse: false,
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
  getVertices({ layer, effects, machine }) {
    this.state = layer
    this.vertices = this.model.getCachedVertices({ shape: layer, machine })
    this.resize()

    const bounds = findBounds(this.vertices)

    this.applyEffects(effects)

    // center relative to our original shape prior to effects
    centerOnOrigin(this.vertices, bounds)
    this.transform()

    return this.vertices
  }

  resize() {
    const { width, height } = this.state

    if (this.model.autosize) {
      this.vertices = resizeVertices(this.vertices, width, height, false)
    }
  }

  transform() {
    const { x, y, rotation } = this.state

    this.vertices.forEach((vertex) => {
      vertex.rotateDeg(-rotation)
      vertex.addX({ x: x || 0 }).addY({ y: y || 0 })
    })

    if (this.state.reverse) {
      this.vertices = this.vertices.reverse()
    }
  }

  applyEffects(effects) {
    effects.forEach((effect) => {
      const effectLayer = new EffectLayer(effect.type)
      this.vertices = effectLayer.getVertices(effect, this.state, this.vertices)
    })
  }
}
