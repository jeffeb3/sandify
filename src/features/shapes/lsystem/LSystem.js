import seedrandom from "seedrandom"
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
  angleOffset: {
    title: "Angle offset",
    type: "slider",
    min: -15,
    max: 15,
    step: 0.5,
    default: 0,
  },
  lsystemBranchProbability: {
    title: "Branch probability",
    type: "slider",
    min: 0,
    max: 100,
    step: 5,
    default: 100,
    isVisible: (model, state) => {
      const subtype = subtypes[state.subtype]

      if (!subtype) return false

      const allRules = subtype.axiom + Object.values(subtype.rules).join("")

      return allRules.includes("[")
    },
  },
  seed: {
    title: "Seed",
    min: 1,
    max: 999,
    step: 1,
    isVisible: (model, state) => {
      const subtype = subtypes[state.subtype]

      if (!subtype) return false

      const allRules = subtype.axiom + Object.values(subtype.rules).join("")
      const hasBranches = allRules.includes("[")

      return hasBranches && (state.lsystemBranchProbability ?? 100) < 100
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
        angleOffset: 0,
        seed: 1,
        lsystemBranchProbability: 100,
      },
    }
  }

  getVertices(state) {
    const shape = state.shape
    const iterations = shape.iterations || 1
    const subtype = subtypes[shape.subtype]
    const baseAngle = subtype.angle !== undefined ? subtype.angle : Math.PI / 2
    const offsetRadians = ((shape.angleOffset || 0) * Math.PI) / 180
    const config = {
      ...subtype,
      iterations,
      side: 5,
      angle: baseAngle + offsetRadians,
      rng: seedrandom(shape.seed),
      branchProbability: (shape.lsystemBranchProbability ?? 100) / 100,
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
