import Effect from "./Effect"

const options = {
  programCodePre: {
    title: "Start code",
    type: "textarea",
  },
  programCodePost: {
    title: "End code",
    type: "textarea",
  },
}

export default class ProgramCode extends Effect {
  constructor() {
    super("programCode")
    this.label = "Program code"
    this.description =
      "When exporting the pattern to a file, the provided program code is added before and/or after this layer is rendered."
  }

  canChangeSize(state) {
    return false
  }

  canRotate(state) {
    return false
  }

  canMove(state) {
    return false
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        programCodePre: "",
        programCodePost: "",
      },
    }
  }

  getVertices(effect, layer, vertices) {
    return vertices
  }

  getOptions() {
    return options
  }
}
