export default class SandifyImporter {
  import(stateString) {
    const state = JSON.parse(stateString)

    return state
  }
}
