import Shape from "../Shape"
import {
  lsystem,
  lsystemPath,
  onSubtypeChange,
  onMinIterations,
  onMaxIterations,
} from "@/common/lindenmayer"
import { subtypes } from "./subtypes"
import { resizeVertices } from "@/common/geometry"

const options = {
  subtype: {
    title: "Type",
    type: "dropdown",
    choices: Object.keys(subtypes),
    onChange: (model, changes, state) => {
      return onSubtypeChange(subtypes[changes.subtype], changes, state)
    },
  },
  iterations: {
    title: "Iterations",
    min: (state) => {
      return onMinIterations(subtypes[state.subtype], state)
    },
    max: (state) => {
      return onMaxIterations(subtypes[state.subtype], state)
    },
  },
}

export default class LSystem extends Shape {
  constructor() {
    super("lsystem")
    this.label = "Fractal Line Writer"
    this.link = "https://en.wikipedia.org/wiki/L-system"
    this.linkText = "L-systems at Wikipedia"
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        iterations: 3,
        subtype: "McWorter's Pentadendrite",
      },
    }
  }

  getVertices(state) {
    const shape = state.shape
    const iterations = shape.iterations || 1

    // generate our vertices using a set of l-system rules
    let config = subtypes[shape.subtype]
    config.iterations = iterations
    config.side = 5

    if (config.angle === undefined) {
      config.angle = Math.PI / 2
    }

    let curve = lsystemPath(lsystem(config), config)
    const scale = 18.0 // to normalize starting size
    return resizeVertices(curve, scale, scale)
  }

  getOptions() {
    return options
  }
}
