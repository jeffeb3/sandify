import { getModelFromType } from "../../config/models"
import { resizeVertices } from "@/common/geometry"

export const layerOptions = {
  name: {
    title: "Name",
    type: "text",
  },
  x: {
    title: "X",
    inline: true,
    isVisible: (model, state) => {
      return model.canMove
    },
  },
  y: {
    title: "Y",
    inline: true,
    isVisible: (model, state) => {
      return model.canMove
    },
  },
  width: {
    title: "W",
    min: 1,
    inline: true,
    isVisible: (model, state) => {
      return model.canChangeSize(state)
    },
    onChange: (model, changes, state) => {
      if (!model.canChangeHeight(state)) {
        changes.height = changes.width
      }
      return changes
    },
  },
  height: {
    title: "H",
    min: 1,
    inline: true,
    isVisible: (model, state) => {
      return model.canChangeSize(state) && model.canChangeHeight(state)
    },
  },
  reverse: {
    title: "Reverse path",
    type: "checkbox",
    isVisible: (model, state) => {
      return !model.effect
    },
  },
  rotation: {
    title: "Rotate (degrees)",
    inline: true,
    isVisible: (model, state) => {
      return model.canRotate(state)
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

  getInitialState(props) {
    return {
      ...this.model.getInitialState(props),
      ...{
        type: this.model.type,
        connectionMethod: "line",
        x: 0.0,
        y: 0.0,
        width: this.model.startingWidth,
        height: this.model.startingHeight,
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
    const { width, height, x, y, rotation } = state.shape
    let vertices = this.model.getVertices(state)

    vertices.forEach((vertex) => {
      if (this.model.autosize) {
        vertices = resizeVertices(vertices, width, height, false)
      }
      vertex.rotateDeg(-rotation)
      vertex.addX({ x: x || 0 }).addY({ y: y || 0 })
    })

    return vertices
  }
}
