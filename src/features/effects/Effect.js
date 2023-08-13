import Model from "@/common/Model"

const effectOptions = []

export default class Effect extends Model {
  constructor(type) {
    super(type)
    this.canMove = false
  }

  // override as needed
  canChangeSize(state) {
    return false
  }

  // override as needed
  canRotate(state) {
    return false
  }

  // override as needed; returns an array of Victor vertices
  getSelectionVertices(effect) {
    return []
  }

  // override as needed
  getVertices(effect, layer, vertices) {
    return []
  }

  getOptions() {
    return effectOptions
  }
}
