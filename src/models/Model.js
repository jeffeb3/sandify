const options = []

export default class Model {
  constructor() {
    this.name = name
    this.cache = []

    Object.assign(this, {
      selectGroup: "Shapes",
      shouldCache: true,
      autosize: true,
      canChangeSize: true,
      canChangeHeight: true,
      canRotate: true,
      canMove: true,
      usesMachine: false,
      usesFonts: false,
      dragging: false,
      effect: false,
    })
  }

  // redux state of a newly created instance
  getInitialState() {
    return {
      startingWidth: 10,
      startingHeight: 10,
    }
  }

  getOptions() {
    return options
  }

  getVertices(state) {
    return []
  }
}
