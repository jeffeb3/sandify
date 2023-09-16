export default class SandifyExporter {
  export(state) {
    const currentMachine = state.machines.entities[state.machines.current]
    const json = {
      effects: { ...state.effects },
      layers: { ...state.layers },
      machine: { ...currentMachine },
    }

    delete json.layers.selected
    delete json.layers.current
    delete json.effects.selected
    delete json.effects.current
    delete json.machine.id

    return JSON.stringify(json, null, "\t")
  }
}
