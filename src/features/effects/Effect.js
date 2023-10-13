import Model from "@/common/Model"

const effectOptions = []

export default class Effect extends Model {
  constructor(type, state) {
    super(type, state)
    this.dragPreview = false
  }

  // override as needed
  canChangeSize(state) {
    return false
  }

  // override as needed
  canRotate(state) {
    return false
  }

  // override as needed
  canMove(state) {
    return false
  }

  // override as needed; returns an array of Victor vertices that are used to
  // render a Konva transformer when the effect is selected
  getSelectionVertices(effect) {
    return []
  }

  // override as needed; returns an array of Victor vertices that are the result
  // of applying the effect to the layer
  getVertices(effect, layer, vertices) {
    return []
  }

  getOptions() {
    return effectOptions
  }
}
