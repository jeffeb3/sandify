import Effect from "./Effect"
import i18n from "@/i18n"

const options = {
  programCodePre: {
    title: i18n.t("effects.programCode.startCode"),
    type: "textarea",
  },
  programCodePost: {
    title: i18n.t("effects.programCode.endCode"),
    type: "textarea",
  },
}

export default class ProgramCode extends Effect {
  constructor() {
    super("programCode")
    this.label = i18n.t("effects.programCode.programCode")
    this.description = i18n.t("effects.programCode.description")
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
