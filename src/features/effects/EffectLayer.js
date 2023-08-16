import { getEffectFromType } from "@/features/effects/factory"

export const effectOptions = {
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
  rotation: {
    title: "Rotate (degrees)",
    inline: true,
    isVisible: (model, state) => {
      return model.canRotate(state)
    },
  },
}

export default class EffectLayer {
  constructor(type) {
    this.model = getEffectFromType(type)
  }

  getInitialState(props) {
    return {
      ...this.model.getInitialState(props),
      ...{
        type: this.model.type,
        visible: true,
        name: this.model.label,
      },
    }
  }

  getOptions() {
    return effectOptions
  }

  getVertices(effect, layer, vertices) {
    return this.model.getVertices(effect, layer, vertices)
  }

  getSelectionVertices(effect) {
    return this.model.getSelectionVertices(effect)
  }
}
