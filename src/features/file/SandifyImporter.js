import Layer from "@/features/layers/Layer"
import EffectLayer from "@/features/effects/EffectLayer"

export default class SandifyImporter {
  import(stateString) {
    const state = JSON.parse(stateString)

    this.checkStructure(state)
    this.ensureIntegrity(state, "layers", Layer)
    this.ensureIntegrity(state, "effects", EffectLayer)
    this.ensureImageIntegrity(state)
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

    if (state.images && !(state.images.entities && state.images.ids)) {
      throw new Error(
        "Invalid file format. The images JSON structure must contain 'ids' and 'entities'.",
      )
    }
  }

  ensureIntegrity(state, slice, ModelClass) {
    // ensure entities only contains data for the provided ids
    state[slice].entities = state[slice].ids.reduce((entities, id) => {
      const data = state[slice].entities[id]

      if (data) {
        const instance = new ModelClass(data.type)
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
    state[slice].ids = this.ensureValidIds(state, slice)
  }

  ensureLayerExists(state) {
    if (!state.layers.ids.length > 0) {
      throw new Error("Pattern cannot be empty.")
    }
  }

  ensureImageIntegrity(state) {
    const imageState = state.images

    if (!imageState) {
      return
    }

    imageState.entities = imageState.ids.reduce((entities, id) => {
      const data = imageState.entities[id]

      if (data) {
        entities[id] = {
          id: data.id,
          src: data.src,
        }
      }

      return entities
    }, {})

    // ensure only ids with valid entities remain
    imageState.ids = this.ensureValidIds(state, "images")
  }

  ensureValidIds(state, slice) {
    return state[slice].ids.filter((id) => {
      return !!state[slice].entities[id]
    })
  }
}
