import Victor from "victor"
import Model from "./Model"

const options = {
  fileName: {
    title: "From file:",
    type: "inputText",
    plainText: "true",
  },
  aspectRatio: {
    title: "Aspect Ratio",
    type: "checkbox",
  },
  comments: {
    title: "Comments",
    type: "comments",
  },
}

export default class FileImport extends Model {
  constructor() {
    super('fileImport')
    this.label = "FileImport"
    this.usesMachine = true
    this.selectGroup = "import"
  }

  getInitialState(importProps) {
    return {
      ...super.getInitialState(),
      ...{
        aspectRatio: true,
        originalAspectRatio: 1.0,
        vertices: [],
        comments: [],
      },
      ...(importProps === undefined
        ? {}
        : {
            fileName: importProps.fileName,
            vertices: importProps.vertices,
            originalAspectRatio: importProps.originalAspectRatio,
            comments: importProps.comments,
          }),
    }
  }

  getVertices(state) {
    if (state.shape.vertices.length < 1) {
      // During initialization, this function gets called, but the machine isn't created right yet.
      return [new Victor(0.0, 0.0), new Victor(0.0, 0.1)]
    }

    let x_scale = (state.machine.maxX - state.machine.minX) / 2.0
    let y_scale = (state.machine.maxY - state.machine.minY) / 2.0

    if (!state.machine.rectangular) {
      x_scale = y_scale = state.machine.maxRadius * 0.1
    }

    if (state.shape.aspectRatio) {
      const machine_aspect_ratio = y_scale / x_scale
      if (state.shape.originalAspectRatio > machine_aspect_ratio) {
        x_scale =
          (x_scale / state.shape.originalAspectRatio) * machine_aspect_ratio
      } else {
        y_scale =
          (y_scale * state.shape.originalAspectRatio) / machine_aspect_ratio
      }
    }

    return state.shape.vertices.map((vertex) => {
      return new Victor(vertex.x * x_scale, vertex.y * y_scale)
    })
  }

  getOptions() {
    return options
  }
}
