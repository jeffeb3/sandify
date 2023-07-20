const options = []

export default class Model {
  constructor(type) {
    this.type = type
    this.cache = []

    Object.assign(this, {
      selectGroup: "Shapes",
      shouldCache: true,
      autosize: true, // TODO: do we need this?
      canMove: true,
      usesMachine: false,
      usesFonts: false,
      dragging: false,
      effect: false,
      startingWidth: 100,
      startingHeight: 100,
    })
  }

  // override as needed
  canChangeSize(state) {
    return true
  }

  // override as needed
  canChangeHeight(state) {
    return this.canChangeSize(state)
  }

  // override as needed
  canRotate(state) {
    return true
  }

  canTransform(state) {
    return this.canMove || this.canRotate(state) || this.canChangeSize(state)
  }

  // redux state of a newly created instance
  getInitialState() {
    return {}
  }

  getOptions() {
    return options
  }

  getVertices(state) {
    return []
  }
}
