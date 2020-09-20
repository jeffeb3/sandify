import Shape, { shapeOptions } from './Shape'
import { getMachineInstance } from '../features/machine/computer'
import Victor from 'victor'
import noise from '../common/noise'
import seedrandom from 'seedrandom'
import { shapeSimilarity } from 'curve-matcher'
import { offset } from '../common/geometry'

const options = {
  ...shapeOptions,
  ...{
    numParticles: {
      title: 'Number of waves',
      min: 1
    },
    iterations: {
      title: 'Iterations',
      min: 1
    },
    seed: {
      title: 'Random seed',
      min: 1
    },
    noiseLevel: {
      title: 'Noise level',
      min: 0,
      max: 600,
      step: 10
    },
    noiseType: {
      title: 'Type',
      type: 'dropdown',
      choices: ['Perlin', 'Simplex'],
    },
    noiseSimilarity: {
      title: 'Curve similarity % (lower value to draw fewer curves)',
      min: 1,
      max: 99,
      step: 1
    },
  }
}

export default class NoiseWave extends Shape {
  constructor() {
    super('Noise Waves')
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        type: 'noise_wave',
        iterations: 200,
        noise: 1,
        seed: 1,
        noiseLevel: 0,
        noiseType: 'perlin2',
        numParticles: 100,
        selectGroup: 'Erasers',
        canTransform: false,
        repeatEnabled: false,
        canChangeSize: false,
        autosize: false,
        usesMachine: true,
      }
    }
  }

  getVertices(state) {
    const machine = state.machine
    const shape = state.shape
    const rng = seedrandom(shape.seed)
    let vertices = []
    let sizeX, sizeY

    if (machine.rectangular) {
      sizeX = machine.maxX - machine.minX
      sizeY = machine.maxY - machine.minY
    } else {
      sizeX = sizeY = machine.maxRadius * 2.0
    }

    noise.seed(shape.seed)

    const particles = []
    const vertexGroups = []

    for (let i=0; i<shape.numParticles; i++) {
      const p1 = {
        x: sizeX * rng() - sizeX/2,
        y: sizeY * rng() - sizeY/2,
        a: 0
      }

      particles.push(p1)
      particles.push({
        x: p1.x,
        y: p1.y,
        a: 2*Math.PI / 2
      })

      vertexGroups.push([])
      vertexGroups.push([])
    }

    for (let iterations=0; iterations<=shape.iterations; iterations++) {
      for (let j=0; j<particles.length; j++) {
        vertexGroups[j].push(this.getParticleVertex(particles[j], shape))
      }
    }

    let prevCurve
    for (let j=0; j<particles.length; j=j+2) {
      let pEndVertices = vertexGroups[j]
      let pStartVertices = vertexGroups[j+1]
      let curve = pStartVertices.reverse().concat(pEndVertices)

      if (vertices.length > 0) {
        const start = vertices[vertices.length - 1]
        const end = curve[0]
        const machineInstance = getMachineInstance([], machine)
        const startPerimeter = machineInstance.nearestPerimeterVertex(start)
        const endPerimeter = machineInstance.nearestPerimeterVertex(end)
        vertices = vertices.concat([startPerimeter, machineInstance.tracePerimeter(startPerimeter, endPerimeter), endPerimeter, end].flat())
      }

      if (!prevCurve || shapeSimilarity(curve, prevCurve, { estimationPoints: 100, rotations: 0 }) < ((state.shape.noiseSimilarity || 88) / 100)) {
        vertices = vertices.concat(curve)
      }

      prevCurve = curve
    }

    vertices = vertices.map(vertex => {
      return offset(vertex, -state.shape.offsetX, -state.shape.offsetY)
    })

    return vertices
  }

  getCurve(vertexGroups, idx) {
    const pEndVertices = vertexGroups[idx]
    const pStartVertices = vertexGroups[idx+1]
    return pStartVertices.reverse().concat(pEndVertices)
  }

  getParticleVertex(p, options) {
    let periodDenominator = 600 - options.noiseLevel
    if (options.noiseLevel >= 600) periodDenominator = 1
    const period = 1/periodDenominator
    const v = options.noiseType === 'Simplex' ? noise.simplex2(p.x * period, p.y * period) : noise.perlin2(p.x * period, p.y * period)
    const a = v * 2 * Math.PI + p.a

    p.x += Math.cos(a) * 5
    p.y += Math.sin(a) * 5

    return new Victor(p.x + options.offsetX, p.y + options.offsetY)
  }

  getOptions() {
    return options
  }
}
