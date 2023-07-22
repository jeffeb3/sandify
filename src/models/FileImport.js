import Victor from "victor"
import { dimensions } from '@/common/geometry'
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

  getInitialState(props) {
    return {
      ...super.getInitialState(),
      ...{
        aspectRatio: true,
        originalAspectRatio: 1.0,
        vertices: [],
        comments: [],
      },
      ...(props === undefined
        ? {}
        : {
            fileName: props.fileName,
            vertices: props.vertices,
            originalAspectRatio: props.originalAspectRatio,
            comments: props.comments,
          }),
    }
  }

  initialDimensions(props) {
    return dimensions(this.initialVertices(props))
  }

  // returns an array of vertices used to calculate the initial width and height of a model;
  // in this case, the props contain vertices newly imported from a file and we'll resize
  // them to machine dimensions.
  initialVertices(props) {
    const { machine, vertices, originalAspectRatio } = props

    let x_scale = (machine.maxX - machine.minX) / 2.0
    let y_scale = (machine.maxY - machine.minY) / 2.0

    if (!machine.rectangular) {
      x_scale = y_scale = machine.maxRadius * 0.1
    }

    const machineAspectRatio = y_scale / x_scale
    if (originalAspectRatio > machineAspectRatio) {
      x_scale = (x_scale / originalAspectRatio) * machineAspectRatio
    } else {
      y_scale = (y_scale * originalAspectRatio) / machineAspectRatio
    }

    return vertices.map((vertex) => {
      return new Victor(vertex.x * x_scale, vertex.y * y_scale)
    })
  }

  getVertices(state) {
    return state.shape.vertices.map(vertex => new Victor(vertex.x, vertex.y))
  }

  getOptions() {
    return options
  }
}
