import { getEffectFromType } from "@/features/effects/factory"

export const effectOptions = {}

export default class EffectLayer {
  constructor(type, state) {
    this.model = getEffectFromType(type, state)
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
}
