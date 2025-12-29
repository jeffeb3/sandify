import { getEffect } from "@/features/effects/effectFactory"
import i18n from "@/i18n"

export const effectOptions = () => ({
  name: {
    title: i18n.t("effects.effectLayer.name"),
    type: "text",
  },
  x: {
    title: i18n.t("effects.effectLayer.x"),
    inline: true,
    isVisible: (model, state) => {
      return model.canMove(state)
    },
  },
  y: {
    title: i18n.t("effects.effectLayer.y"),
    inline: true,
    isVisible: (model, state) => {
      return model.canMove(state)
    },
  },
  width: {
    title: i18n.t("effects.effectLayer.w"),
    min: 1,
    inline: true,
    isVisible: (model, state) => {
      return model.canChangeSize(state)
    },
    onChange: (model, changes, state) => {
      if (state.maintainAspectRatio) {
        changes.height = changes.width
      } else {
        changes.aspectRatio = changes.width / state.height
      }
      return changes
    },
  },
  height: {
    title: i18n.t("effects.effectLayer.h"),
    min: 1,
    inline: true,
    onChange: (model, changes, state) => {
      if (state.maintainAspectRatio) {
        changes.width = changes.height
      } else {
        changes.aspectRatio = state.width / changes.height
      }
      return changes
    },
  },
  maintainAspectRatio: {
    title: i18n.t("effects.effectLayer.lockAspectRatio"),
    type: "checkbox",
  },
  rotation: {
    title: i18n.t("effects.effectLayer.rotateDegrees"),
    inline: true,
    isVisible: (model, state) => {
      return model.canRotate(state)
    },
  },
})

export default class EffectLayer {
  constructor(type) {
    this.model = getEffect(type)
  }

  getInitialState(layer, layerVertices) {
    const state = {
      ...this.model.getInitialState(layer, layerVertices),
      ...{
        type: this.model.type,
        visible: true,
        name: this.model.label,
      },
    }

    if (this.model.canChangeSize(state)) {
      state.aspectRatio = 1.0
    }

    if (this.model.canMove(state) && state.x === undefined) {
      state.x = 0
      state.y = 0
    }

    if (this.model.canRotate(state) && state.rotation === undefined) {
      state.rotation = 0
    }

    return state
  }

  getOptions() {
    return effectOptions()
  }

  getVertices(effect, layer, vertices) {
    return this.model.getVertices(effect, layer, vertices)
  }

  getSelectionVertices(effect) {
    return this.model.getSelectionVertices(effect)
  }

  // used to preserve hidden attributes when loading from a file
  getHiddenAttrs() {
    return ["layerId"]
  }
}
