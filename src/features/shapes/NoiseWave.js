import Victor from "victor"
import noise from "@/common/noise"
import seedrandom from "seedrandom"
import { shapeSimilarity } from "curve-matcher"
import { offset } from "@/common/geometry"
import { getMachine } from "@/features/machines/machineFactory"
import Shape from "./Shape"

const options = {
  numParticles: {
    title: "Number of waves",
    min: 1,
  },
  seed: {
    title: "Random seed",
    min: 1,
    randomMax: 1000,
  },
  noiseLevel: {
    title: "Noise level",
    min: 0,
    max: 600,
    step: 10,
    random: 0.5,
  },
  noiseType: {
    title: "Type",
    type: "dropdown",
    choices: ["Perlin", "Simplex"],
  },
}

export default class NoiseWave extends Shape {
  constructor() {
    super("noise_wave")
    this.label = "Noise waves"
    this.selectGroup = "Erasers"
    this.usesMachine = true
    this.autosize = false
    this.link = "https://en.wikipedia.org/wiki/Perlin_noise"
    this.linkText = "Wikipedia"
    this.description =
      "Perlin noise is a type of gradient noise that can be used to generate textures and terrain. Here we use it to create an appealing series of wavy lines."
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
        noise: 1,
        seed: 1,
        noiseLevel: 0,
        noiseType: "Perlin",
        numParticles: 100,
      },
    }
  }

  getVertices(state) {
    // without this adjustment, using an inverted circular mask causes clipping issues
    const adjustment = 0.001
    const machineState = {
      ...state.machine,
      maxRadius: state.machine.maxRadius - adjustment,
    }
    const shape = state.shape
    const rng = seedrandom(shape.seed)
    const machine = getMachine(machineState)
    const { sizeX, sizeY } = machine
    let vertices = []

    noise.seed(shape.seed)

    const particles = []

    for (let i = 0; i < shape.numParticles; i++) {
      const p1 = {
        x: sizeX * rng() - sizeX / 2,
        y: sizeY * rng() - sizeY / 2,
        a: 0,
      }

      particles.push(p1)
      particles.push({
        x: p1.x,
        y: p1.y,
        a: (2 * Math.PI) / 2,
      })
    }

    const vertexGroups = particles.map((particle) => {
      let group = []
      let wasInside = false

      // Arbitrarily choose 1000 iterations. This will stop particles that don't ever intersect with
      // the machine. It needs to be high enough to always leave the machine for particles that
      // don't move very fast.
      for (let iterations = 0; iterations <= 1000; iterations++) {
        // This has side effects on the particle
        const newVertex = this.getParticleVertex(particle, shape)

        group.push(newVertex)

        // Stop if we entered and then exited the machine coordinates.
        const inside = machine.inBounds(newVertex)
        if (wasInside && !inside) {
          break
        }
        wasInside = inside
      }

      return group
    })

    let prevCurve
    for (let j = 0; j < particles.length; j = j + 2) {
      const curve = this.getCurve(vertexGroups, j)

      // Connect to the previous vertex, if there are any previous vertices.
      if (vertices.length > 0) {
        const start = vertices[vertices.length - 1]
        const end = curve[0]
        const startPerimeter = machine.nearestPerimeterVertex(start)
        const endPerimeter = machine.nearestPerimeterVertex(end)

        vertices = vertices.concat(
          [
            startPerimeter,
            machine.tracePerimeter(startPerimeter, endPerimeter),
            endPerimeter,
            end,
          ].flat(),
        )
      }

      if (
        !prevCurve ||
        shapeSimilarity(curve, prevCurve, {
          estimationPoints: 100,
          rotations: 0,
        }) <
          (state.shape.noiseSimilarity || 88) / 100
      ) {
        vertices = vertices.concat(curve)
      }
      prevCurve = curve
    }

    vertices = vertices.map((vertex) => {
      return offset(vertex, -state.shape.x, -state.shape.y)
    })

    return vertices
  }

  getCurve(vertexGroups, idx) {
    const pEndVertices = vertexGroups[idx]
    const pStartVertices = vertexGroups[idx + 1]

    return pStartVertices.reverse().concat(pEndVertices)
  }

  getParticleVertex(p, options) {
    let periodDenominator = 600 - options.noiseLevel

    if (options.noiseLevel >= 600) periodDenominator = 1

    const period = 1 / periodDenominator
    const v =
      options.noiseType === "Simplex"
        ? noise.simplex2(p.x * period, p.y * period)
        : noise.perlin2(p.x * period, p.y * period)
    const a = v * 2 * Math.PI + p.a

    p.x += Math.cos(a) * 5
    p.y += Math.sin(a) * 5

    return new Victor(p.x + options.x, p.y + options.y)
  }

  getOptions() {
    return options
  }
}
