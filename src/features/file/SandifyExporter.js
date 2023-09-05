export default class SandifyExporter {
  export(state) {
    const json = {
      effects: { ...state.effects },
      layers: { ...state.layers },
    }

    delete json.layers.selected
    delete json.layers.current
    delete json.effects.selected
    delete json.effects.current

    return JSON.stringify(json, null, "\t")
  }
}
