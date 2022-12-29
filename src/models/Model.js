export const modelOptions = {
}

export default class Model {
  constructor(type) {
    this.type = type
  }

  getInitialState() {
    return {
    }
  }

  getOptions() {
    return modelOptions
  }

  getVertices(state) {
    return []
  }

}
