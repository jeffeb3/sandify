import { resizeVertices, dimensions, pointsToVertices } from "@/common/geometry"
import { getMachineInstance } from "@/features/machine/computer"
import Model from "./Model"

const options = {
  fileName: {
    title: "Source file",
    type: "inputText",
    plainText: "true",
  },
  comments: {
    title: "Comments",
    type: "comments",
  },
}

export default class FileImport extends Model {
  constructor() {
    super("fileImport")
    this.label = "FileImport"
    this.usesMachine = true
    this.selectGroup = "import"
  }

  getInitialState(props) {
    return {
      ...super.getInitialState(),
      ...{
        vertices: [],
        comments: [],
      },
      ...(props === undefined
        ? {}
        : {
            fileName: props.fileName,
            vertices: props.vertices,
            comments: props.comments,
          }),
    }
  }

  initialDimensions(props) {
    const { machine } = props
    const vertices = pointsToVertices(props.vertices)
    const machineInstance = getMachineInstance(vertices, machine)

    // default to 80% of machine size
    resizeVertices(
      vertices,
      machineInstance.width * 0.8,
      machineInstance.height * 0.8,
    )

    return dimensions(vertices)
  }

  getVertices(state) {
    return pointsToVertices(state.shape.vertices)
  }

  getOptions() {
    return options
  }
}
