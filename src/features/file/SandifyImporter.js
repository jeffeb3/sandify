import Layer from "@/features/layers/Layer"
import EffectLayer from "@/features/effects/EffectLayer"

export default class SandifyImporter {
  import(stateString) {
    let state = JSON.parse(stateString)

    this.checkStructure(state)
    this.ensureIntegrity(state, "layers", Layer)
    this.ensureIntegrity(state, "effects", EffectLayer)
    this.ensureLayerExists(state)

    return state
  }

  checkStructure(state) {
    if (
      !(
        state.layers &&
        state.effects &&
        state.layers.entities &&
        state.layers.ids &&
        state.effects.entities &&
        state.effects.ids
      )
    ) {
      throw new Error(
        "Invalid file format. The JSON structure must contain 'layers' and 'effects', both with 'entities' and 'ids'",
      )
    }
  }

  ensureIntegrity(state, slice, LayerClass) {
    // ensure entities only contains data for the provided ids
    state[slice].entities = state[slice].ids.reduce((entities, id) => {
      const data = state[slice].entities[id]

      if (data) {
        const instance = new LayerClass(data.type)
        const layer = instance.getInitialState()

        // ensure each entity only contains attributes defined by the layer
        Object.keys(layer).forEach((attr) => {
          if (data[attr] != undefined) {
            layer[attr] = data[attr]
          }
        })

        instance.getHiddenAttrs().forEach((attr) => {
          layer[attr] = data[attr]
        })

        entities[id] = {
          ...layer,
          id,
        }
      }

      return entities
    }, {})

    // ensure only ids with valid entities remain
    state[slice].ids = state[slice].ids.filter((id) => {
      return !!state[slice].entities[id]
    })
  }

  ensureLayerExists(state) {
    if (!state.layers.ids.length > 0) {
      throw new Error("Pattern cannot be empty.")
    }
  }
}
