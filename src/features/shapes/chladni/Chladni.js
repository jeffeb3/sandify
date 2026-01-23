import Victor from "victor"
import Shape from "../Shape"
import { SUPERPOSITION } from "./config"
import { drawContours, drawBorder, buildPath } from "./pathBuilder"

const options = {
  chladniMethod: {
    title: "Method",
    type: "togglebutton",
    choices: ["interference", "harmonic", "excitation"],
  },
  chladniShape: {
    title: "Shape",
    type: "togglebutton",
    choices: ["rectangular", "circular"],
  },
  chladniM: {
    title: "M",
    min: (state) => (state.chladniShape === "circular" ? 0 : 1),
    max: 10,
    step: 1,
    isVisible: (layer, state) => state.chladniMethod === "interference",
  },
  chladniN: {
    title: "N",
    min: 1,
    max: 10,
    step: 1,
    isVisible: (layer, state) => state.chladniMethod === "interference",
  },
  chladniModes: {
    title: "Complexity",
    min: 1,
    max: (state) => {
      if (
        state.chladniMethod === "excitation" &&
        state.chladniShape === "circular"
      )
        return 5
      return 10
    },
    step: 1,
    isVisible: (layer, state) =>
      state.chladniMethod === "harmonic" ||
      state.chladniMethod === "excitation",
  },
  chladniRadial: {
    title: "Radial",
    min: 1,
    max: 10,
    step: 1,
    isVisible: (layer, state) =>
      state.chladniShape === "circular" &&
      !(
        state.chladniMethod === "interference" &&
        state.chladniSuperposition === "rings"
      ),
  },
  chladniDecay: {
    title: "Decay",
    type: "slider",
    min: 0,
    max: 12,
    isVisible: (layer, state) => state.chladniMethod === "harmonic",
  },
  chladniFrequency: {
    title: "Zoom",
    min: 1,
    max: (state) => {
      if (
        state.chladniMethod === "harmonic" &&
        state.chladniShape === "circular"
      )
        return 3
      return state.chladniModes > 4 ? 3 : 5
    },
    step: 0.25,
    isVisible: (layer, state) =>
      state.chladniMethod === "harmonic" ||
      state.chladniMethod === "excitation",
  },
  chladniExcitation: {
    title: "Excitation",
    type: "togglebutton",
    choices: ["dome", "mosaic", "cell"],
    isVisible: (layer, state) =>
      state.chladniMethod === "excitation" &&
      state.chladniShape === "rectangular",
  },
  chladniContours: {
    title: "Contours",
    type: "slider",
    min: 1,
    max: 5,
    step: 1,
  },
  chladniSpread: {
    title: "Spread",
    type: "slider",
    min: 1,
    max: 9,
    isVisible: (layer, state) =>
      state.chladniMethod === "excitation" && state.chladniModes >= 2,
  },
  chladniPosition: {
    title: "Position",
    type: "slider",
    min: 0,
    max: 10,
    isVisible: (layer, state) =>
      state.chladniMethod === "excitation" &&
      state.chladniShape === "rectangular" &&
      state.chladniExcitation === "cell",
  },
  chladniBoundary: {
    title: "Boundary",
    type: "togglebutton",
    choices: ["free", "fixed"],
    isVisible: (layer, state) =>
      state.chladniMethod !== "excitation" &&
      !(
        state.chladniMethod === "harmonic" && state.chladniShape === "circular"
      ),
  },
  chladniDomain: {
    title: "Domain",
    type: "togglebutton",
    choices: ["centered", "tiled"],
    isVisible: (layer, state) =>
      state.chladniMethod === "interference" &&
      state.chladniShape === "rectangular",
  },
  chladniSuperposition: {
    title: "Superposition",
    type: "dropdown",
    choices: Object.keys(SUPERPOSITION),
    isVisible: (layer, state) => state.chladniMethod === "interference",
  },
  chladniAmplitude: {
    title: "Amplitude",
    min: 1,
    max: 16,
    step: 1,
    isVisible: (layer, state) =>
      state.chladniMethod === "interference" && state.chladniContours > 1,
  },
}

export default class Chladni extends Shape {
  constructor() {
    super("chladni")
    this.label = "Vibration"
    this.link = "https://en.wikipedia.org/wiki/Chladni_figure"
    this.linkText = "Wikipedia"
    this.description =
      "Chladni figures are nodal line patterns from vibrating plates. Sand collects along lines where amplitude is zero."
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      chladniMethod: "interference",
      chladniShape: "rectangular",
      chladniM: 2,
      chladniN: 4,
      chladniModes: 3,
      chladniRadial: 3,
      chladniDecay: 3,
      chladniFrequency: 1,
      chladniExcitation: "dome",
      chladniSpread: 3,
      chladniPosition: 5,
      chladniSuperposition: "subtract",
      chladniAmplitude: 4,
      chladniBoundary: "fixed",
      chladniDomain: "centered",
      chladniContours: 3,
    }
  }

  getOptions() {
    return options
  }

  getVertices(state) {
    const method = state.shape.chladniMethod
    const shape = state.shape.chladniShape
    const m = parseInt(state.shape.chladniM)
    const n = parseInt(state.shape.chladniN)
    const modes = parseInt(state.shape.chladniModes)
    const radial = parseInt(state.shape.chladniRadial)
    const decay = parseFloat(state.shape.chladniDecay)
    const frequency = parseFloat(state.shape.chladniFrequency)
    const excitation =
      shape === "circular" ? "mosaic" : state.shape.chladniExcitation
    const spread = parseFloat(state.shape.chladniSpread)
    const position = parseFloat(state.shape.chladniPosition)
    const superposition = state.shape.chladniSuperposition
    const amplitude = parseFloat(state.shape.chladniAmplitude)
    const boundary = state.shape.chladniBoundary
    const domain = state.shape.chladniDomain
    const contourLevels = parseInt(state.shape.chladniContours)
    const scale = 50

    // Handle degenerate case: m=n with "add" gives z=0 everywhere (interference only)
    if (method === "interference" && m === n && superposition === "add") {
      return [
        new Victor(-scale, -scale),
        new Victor(scale, scale),
        new Victor(0, 0),
        new Victor(-scale, scale),
        new Victor(scale, -scale),
      ]
    }

    const paths = drawContours({
      method,
      shape,
      m,
      n,
      modes,
      radial,
      decay,
      frequency,
      excitation,
      spread,
      position,
      superposition,
      amplitude,
      boundary,
      domain,
      contourLevels,
    })
    const allPaths = [...paths, drawBorder(shape)]
    const vertices = buildPath(allPaths)

    return vertices.map((v) => new Victor(v.x * scale, v.y * scale))
  }
}
