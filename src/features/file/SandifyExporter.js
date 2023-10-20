import { SANDIFY_VERSION } from "@/features/app/appSlice"

export default class SandifyExporter {
  export(state) {
    const currentMachine = state.machines.entities[state.machines.current]
    const json = {
      version: SANDIFY_VERSION,
      effects: { ...state.effects },
      images: { ...state.images },
      layers: { ...state.layers },
      machine: { ...currentMachine },
    }

    delete json.images.loaded
    delete json.layers.selected
    delete json.layers.current
    delete json.effects.selected
    delete json.effects.current
    delete json.machine.id

    return JSON.stringify(json, null, "\t")
  }
}
