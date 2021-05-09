import { shapeOptions } from './Shape'
import Victor from 'victor'
import Effect from './Effect'
import noise from '../common/noise'

const options = {
  ...shapeOptions,
  ...{
    seed: {
      title: 'Random seed',
      min: 1
    },
    noiseMagnification: {
      title: 'Magnification',
      min: 0,
      max: 100,
      step: 1,
      isVisible: (state) => { return state.noiseApplication !== 'Linear' }
    },
    noiseAmplitude: {
      title: 'Amplitude',
      min: 0,
      max: 20,
      step: 1,
      isVisible: (state) => { return state.noiseApplication !== 'Contour 2' }
    },
    noiseType: {
      title: 'Noise type',
      type: 'togglebutton',
      choices: ['Perlin', 'Simplex'],
    },
    noiseApplication: {
      title: 'Application',
      type: 'dropdown',
      choices: ['Linear', 'Contour 1', 'Contour 2'],
    },
    subsample: {
      title: 'Subsample points (increase resolution)',
      type: 'checkbox',
    },
  }
}

export default class Noise extends Effect {
  constructor() {
    super('Noise')
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        type: 'noise',
        selectGroup: 'effects',
        seed: 1,
        noiseAmplitude: 3,
        noiseMagnification: 25,
        noiseType: 'Perlin',
        noiseApplication: 'Linear',
        canTransform: false,
        repeatEnabled: false,
        canChangeSize: false,
        canRotate: false,
        canMove: false,
        subsample: true
      }
    }
  }

  applyEffect(effect, layer, vertices) {
    if (effect.noiseAmplitude > 0) {
      noise.seed(effect.seed)
      vertices = this.subsampleVertices(effect, vertices)

      if (effect.noiseApplication === 'Linear') {
        return this.applyLinearEffect(effect, vertices)
      } else if (effect.noiseApplication === 'Contour 1') {
        return this.applyRadialEffect(effect, vertices, this.contour1)
      } else {
        return this.applyRadialEffect(effect, vertices, this.contour2)
      }
    } else {
      return vertices
    }
  }

  applyLinearEffect(effect, vertices) {
    return vertices.map(vertex => {
      const a = this.octaveNoise(effect.noiseType, vertex.x, vertex.y, 2, effect.noiseAmplitude)
      return new Victor(vertex.x + a, vertex.y + a)
    })
  }

  applyRadialEffect(effect, vertices, contourFn) {
    let periodDenominator = effect.noiseType === 'Simplex' ?
      600 - 6 * effect.noiseMagnification :
      300 - 3 * effect.noiseMagnification
    if (periodDenominator === 0) periodDenominator = 1
    const period = 1/periodDenominator

    return vertices.map(vertex => {
      const v = this.noise(effect.noiseType, vertex.x * period, vertex.y * period)
      const a = v * Math.PI * 2
      return contourFn(a * effect.noiseAmplitude, vertex)
    })
  }

  noise(noiseType, x, y) {
    return noiseType === 'Simplex' ? noise.simplex2(x, y) : noise.perlin2(x, y)
  }

  octaveNoise(noiseType, x, y, octaves, persistence) {
      let total = 0
      let frequency = 1
      let amplitude = 1

      for(let i=0; i<octaves; i++) {
        total += this.noise(noiseType, x * frequency, y * frequency) * amplitude
        amplitude *= persistence
        frequency *= 2
      }

      return total
  }

  contour1(a, vertex) {
    return new Victor(vertex.x + Math.cos(a) * 5, vertex.y + Math.sin(a) * 5)
  }

  contour2(a, vertex) {
    return new Victor(vertex.x + Math.atan(a) * 5, vertex.y + Math.atan(a) * 5)
  }

  getVertices(state) {
    // not needed
    return []
  }

  getOptions() {
    return options
  }
}
