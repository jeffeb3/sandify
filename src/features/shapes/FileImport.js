import { resizeVertices, dimensions, cloneVertices } from "@/common/geometry"
import { getMachine } from "@/features/machines/machineFactory"
import Shape from "./Shape"

const options = {
  fileName: {
    title: "Source file",
    type: "inputText",
    plainText: "true",
  },
}

export default class FileImport extends Shape {
  constructor() {
    super("fileImport")
    this.label = "import"
    this.usesMachine = true
    this.selectGroup = "import"
  }

  getInitialState(props) {
    return {
      ...super.getInitialState(),
      ...{
        vertices: [],
        maintainAspectRatio: true,
      },
      ...(props === undefined
        ? {}
        : {
            fileName: props.fileName,
            vertices: props.vertices,
          }),
    }
  }

  initialDimensions(props) {
    if (!props) { // undefined during import integrity checks
      return {
        width: 0,
        height: 0
      }
    }

    const vertices = cloneVertices(props.vertices)
    const machine = getMachine(props.machine)

    // default to 80% of machine size
    resizeVertices(vertices, machine.width * 0.8, machine.height * 0.8)

    return dimensions(vertices)
  }

  getVertices(state) {
    return cloneVertices(state.shape.vertices)
  }

  getOptions() {
    return options
  }
}
