import Shape from "../Shape"
import {
  lsystem,
  lsystemPath,
  lsystemOptimize,
  onSubtypeChange,
  onMinIterations,
  onMaxIterations,
} from "@/common/lindenmayer"
import { resizeVertices, centerOnOrigin } from "@/common/geometry"
import { subtypes } from "./subtypes"
import { getMachine } from "@/features/machines/machineFactory"

const options = {
  fillerSubtype: {
    title: "Type",
    type: "dropdown",
    choices: Object.keys(subtypes),
    onChange: (model, changes, state) => {
      return onSubtypeChange(subtypes[changes.fillerSubtype], changes, state)
    },
  },
  iterations: {
    title: "Iterations",
    min: (state) => {
      return onMinIterations(subtypes[state.fillerSubtype], state)
    },
    max: (state) => {
      return onMaxIterations(subtypes[state.fillerSubtype], state)
    },
  },
}

export default class SpaceFiller extends Shape {
  constructor() {
    super("spaceFiller")
    this.label = "Space filler"
    this.usesMachine = true
    this.autosize = false
    this.selectGroup = "Erasers"
    this.linkText = "Wikipedia"
    this.description =
      "A space-filling curve draws a single, continuous line that covers every point in a space without missing any spots or crossing itself."
    this.link = "https://en.wikipedia.org/wiki/Space-filling_curve"
  }

  canMove(state) {
    return false
  }

  canChangeSize(state) {
    return false
  }

  canRotate(state) {
    return false
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        iterations: 6,
        fillerSubtype: "Hilbert",
      },
    }
  }

  getVertices(state) {
    const machine = getMachine(state.machine)
    const iterations = state.shape.iterations || 1
    let { sizeX, sizeY } = machine

    if (state.machine.type === "rectangular") {
      sizeX = sizeX * 2
      sizeY = sizeY * 2
    }

    // generate our vertices using a set of l-system rules
    let config = subtypes[state.shape.fillerSubtype]

    config.iterations = iterations
    if (config.side === undefined) {
      config.side = 5
    }
    if (config.angle === undefined) {
      config.angle = Math.PI / 2
    }

    let curve = lsystemOptimize(lsystemPath(lsystem(config), config), config)
    let scale = 1

    if (config.iterationsGrow) {
      scale =
        typeof config.iterationsGrow === "function"
          ? config.iterationsGrow(config)
          : config.iterationsGrow
    }

    return centerOnOrigin(resizeVertices(curve, sizeX * scale, sizeY * scale))
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
    const changes = super.randomChanges(tempLayer, ["fillerSubtype"])

    changes.fillerSubtype = subtype

    return onSubtypeChange(subtypes[changes.subtype], changes, tempLayer)
  }
}
