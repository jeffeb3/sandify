import Shape from "../Shape"
import {
  lsystem,
  lsystemPath,
  lsystemOptimize,
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
    this.label = "Fractal line writer"
    this.link = "https://en.wikipedia.org/wiki/L-system"
    this.linkText = "Wikipedia"
    this.description =
      "The fractal line writer shape is a Lindenmayer (or L) system. L-systems chain symbols together to specify instructions for moving in a 2d space (e.g., turn left or right, walk left or right). When applied recursively, they generate fractal-like patterns."
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

    const path = lsystemOptimize(lsystemPath(lsystem(config), config), config)
    const scale = 18.0 // to normalize starting size

    return resizeVertices(path, scale, scale)
  }

  getOptions() {
    return options
  }

  // hack to randomly select the subtype before randomizing the other shape values
  randomChanges(layer) {
    const subtypeChoices = Object.keys(subtypes)
    const choice = Math.floor(Math.random() * subtypeChoices.length)
    const subtype = subtypeChoices[choice]
    const tempLayer = { ...layer, subtype }
    const changes = super.randomChanges(tempLayer, ["subtype"])

    changes.subtype = subtype

    return onSubtypeChange(subtypes[changes.subtype], changes, tempLayer)
  }
}
