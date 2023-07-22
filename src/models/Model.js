import { resizeVertices, dimensions } from "@/common/geometry"

const options = []

export default class Model {
  constructor(type) {
    this.type = type
    this.cache = []

    Object.assign(this, {
      selectGroup: "Shapes",
      shouldCache: true,
      autosize: true,
      canMove: true,
      usesMachine: false,
      usesFonts: false,
      dragging: false,
      effect: false,
      startingWidth: 100,
      startingHeight: 100,
      startingAspectRatioLocked: true,
    })
  }

  // calculates the initial dimensions of the model
  initialDimensions(props) {
    if (this.autosize) {
      const vertices = this.initialVertices(props)

      resizeVertices(
        vertices,
        this.startingWidth,
        this.startingHeight,
        this.startingAspectRatioLocked,
      )

      return dimensions(vertices)
    } else {
      return {
        width: this.startingWidth,
        height: this.startingHeight,
      }
    }
  }

  // returns an array of vertices used to calculate the initial width and height of a model
  initialVertices(props) {
    return this.getVertices({
      shape: this.getInitialState(props),
      creating: true,
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
