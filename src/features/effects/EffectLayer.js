import { getEffectFromType } from "@/features/effects/factory"

export const effectOptions = {
  width: {
    title: "W",
    min: 1,
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
    isVisible: (model, state) => {
      return model.canChangeSize(state) && model.canChangeHeight(state)
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
