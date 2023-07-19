import { getModelFromType } from "../../config/models"

export const layerOptions = {
  name: {
    title: "Name",
    type: "text",
  },
  x: {
    title: "X",
    inline: true,
    isVisible: (model) => {
      return model.canMove
    },
  },
  y: {
    title: "Y",
    inline: true,
    isVisible: (model) => {
      return model.canMove
    },
  },
  startingWidth: {
    title: "Initial width",
    min: 1,
    isVisible: (model) => {
      return model.canChangeSize
    },
    onChange: (changes, attrs) => {
      if (!attrs.canChangeHeight) {
        changes.startingHeight = changes.startingWidth
      }
      return changes
    },
  },
  startingHeight: {
    title: "Initial height",
    min: 1,
    isVisible: (model) => {
      return model.canChangeSize && model.canChangeHeight
    },
  },
  reverse: {
    title: "Reverse path",
    type: "checkbox",
    isVisible: (model) => {
      return !model.effect
    },
  },
  rotation: {
    title: "Rotate (degrees)",
    isVisible: (model) => {
      return model.canRotate
    },
  },
  connectionMethod: {
    title: "Connect to next layer",
    type: "togglebutton",
    choices: ["line", "along perimeter"],
  },
}

export default class Layer {
  constructor(type) {
    this.model = getModelFromType(type)
  }

  getInitialState() {
    return {
      ...this.model.getInitialState(),
      ...{
        connectionMethod: "line",
        x: 0.0,
        y: 0.0,
        rotation: 0,
        reverse: false,
        visible: true,
        name: this.model.label,
      },
    }
  }

  getOptions() {
    return layerOptions
  }

  getVertices(state) {
    const {
      startingWidth,
      startingHeight,
      autosize,
      x,
      y,
      rotation,
    } = state.shape
    let vertices = this.model.getVertices(state)

    vertices.forEach((vertex) => {
      vertex.multiply({ x: startingWidth, y: startingHeight })
      vertex.rotateDeg(-rotation)
      vertex.addX({ x: x || 0 }).addY({ y: y || 0 })
    })

    return vertices
  }
}
