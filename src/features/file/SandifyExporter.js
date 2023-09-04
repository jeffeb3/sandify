export default class SandifyExporter {
  export(state) {
    const json = {
      effects: state.effects,
      layers: state.layers,
    }

    return JSON.stringify(json, null, "\t")
  }
}
