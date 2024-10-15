import Victor from "victor"
import Effect from "../Effect"
import noise from "@/common/noise"
import { subsample } from "@/common/geometry"

const options = {
  seed: {
    title: "Random seed",
    min: 1,
    randomMax: 1000,
  },
  noiseMagnification: {
    title: "Magnification",
    min: 1,
    max: 100,
    step: 1,
    isVisible: (layer, state) => {
      return state.noiseApplication !== "Linear"
    },
  },
  noiseAmplitude: {
    title: "Amplitude",
    min: 0,
    max: 20,
    step: 1,
  },
  noiseType: {
    title: "Noise type",
    type: "togglebutton",
    choices: ["Perlin", "Simplex"],
  },
  noiseApplication: {
    title: "Application",
    type: "togglebutton",
    choices: ["Contour", "Linear"],
  },
}

export default class Noise extends Effect {
  constructor() {
    super("noise")
    this.label = "Noise"
  }

  canRotate(state) {
    return false
  }

  canChangeSize(state) {
    return false
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        seed: 1,
        noiseAmplitude: 4,
        noiseMagnification: 58,
        noiseType: "Simplex",
        noiseApplication: "Contour",
        subsample: true,
      },
    }
  }

  getVertices(effect, layer, vertices) {
    if (effect.noiseAmplitude > 0) {
      noise.seed(effect.seed)
      vertices = subsample(vertices, 2.0)

      if (effect.noiseApplication === "Linear") {
        return this.applyLinearEffect(effect, vertices)
      } else {
        return this.applyRadialEffect(effect, vertices, this.contour)
      }
    } else {
      return vertices
    }
  }

  applyLinearEffect(effect, vertices) {
    return vertices.map((vertex) => {
      const a = this.octaveNoise(
        effect.noiseType,
        vertex.x,
        vertex.y,
        2,
        effect.noiseAmplitude,
      )
      return new Victor(vertex.x + a, vertex.y + a)
    })
  }

  applyRadialEffect(effect, vertices, contourFn) {
    let periodDenominator =
      effect.noiseType === "Simplex"
        ? 100 + 6 * effect.noiseMagnification
        : 100 + effect.noiseMagnification
    if (periodDenominator === 0) periodDenominator = 1
    const period = 1 / periodDenominator

    return vertices.map((vertex) => {
      const v = this.noise(
        effect.noiseType,
        vertex.x * period,
        vertex.y * period,
      )
      const a = v * Math.PI * 2
      return contourFn(a * effect.noiseAmplitude, vertex)
    })
  }

  noise(noiseType, x, y) {
    return noiseType === "Simplex" ? noise.simplex2(x, y) : noise.perlin2(x, y)
  }

  octaveNoise(noiseType, x, y, octaves, persistence) {
    let total = 0
    let frequency = 1
    let amplitude = 1

    for (let i = 0; i < octaves; i++) {
      total += this.noise(noiseType, x * frequency, y * frequency) * amplitude
      amplitude *= persistence
      frequency *= 2
    }

    return total
  }

  contour(a, vertex) {
    return new Victor(vertex.x + Math.cos(a) * 5, vertex.y + Math.sin(a) * 5)
  }

  getOptions() {
    return options
  }
}
