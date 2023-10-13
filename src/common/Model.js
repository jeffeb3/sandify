const options = []

export default class Model {
  constructor(type, state) {
    this.type = type
    this.state = state

    Object.assign(this, {
      usesMachine: false,
      usesFonts: false,
      dragging: false,
      stretch: false,
    })
  }

  // override as needed
  canChangeSize(state) {
    return true
  }

  // override as needed
  canChangeAspectRatio(state) {
    return this.canChangeSize(state)
  }

  // override as needed
  canRotate(state) {
    return true
  }

  // override as needed
  canMove(state) {
    return true
  }

  canTransform(state) {
    return (
      this.canMove(state) || this.canRotate(state) || this.canChangeSize(state)
    )
  }

  // override as needed; redux state of a newly created instance
  getInitialState() {
    return {}
  }

  getOptions() {
    return options
  }
}
