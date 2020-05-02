import Shape, { shapeOptions } from '../Shape'
import {
  lsystem,
  lsystemPath,
  onSubtypeChange,
  onMinIterations,
  onMaxIterations
} from '../../common/lindenmayer'
import { resizeVertices } from '../../common/geometry'
import { subtypes } from './subtypes'

const options = {
  ...shapeOptions,
  ...{
    subtype: {
      title: 'Type',
      type: 'dropdown',
      choices: Object.keys(subtypes),
      onChange: (changes, attrs) => {
        return onSubtypeChange(subtypes[changes.subtype], changes, attrs)
      }
    },
    iterations: {
      title: 'Iterations',
      min: (state) => {
        return onMinIterations(subtypes[state.subtype], state)
      },
      max: (state) => {
        return onMaxIterations(subtypes[state.subtype], state)
      }
    }
  }
}

export default class SpaceFiller extends Shape {
  constructor() {
    super('Space Filler')
    this.linkText = 'Fractal charm: space filling curves'
    this.link = 'https://www.youtube.com/watch?v=RU0wScIj36o'
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        type: 'space_filler',
        selectGroup: 'Erasers',
        canTransform: false,
        shouldCache: false,
        iterations: 6,
        subtype: 'Hilbert'
      }
    }
  }

  getInitialTransformState() {
    return {
      ...super.getInitialTransformState(),
      ...{
        repeatEnabled: false,
        startingSize: 1,
        canChangeSize: false,
      }
    }
  }

  getVertices(state) {
    const machine = state.machine
    const iterations = state.shape.iterations || 1

    let sizeX, sizeY
    if (machine.rectangular) {
      sizeX = machine.maxX - machine.minX
      sizeY = machine.maxY - machine.minY
    } else {
      sizeX = sizeY = machine.maxRadius * 2.0
    }

    // generate our vertices using a set of l-system rules
    let config = subtypes[state.shape.subtype]
    config.iterations = iterations

    if (config.side === undefined) { config.side = 5 }
    if (config.angle === undefined) { config.angle = Math.PI/2 }

    let curve = lsystemPath(lsystem(config), config)
    let scale = 1

    if (config.iterationsGrow) {
      scale = (typeof config.iterationsGrow === 'function') ? config.iterationsGrow(config) : config.iterationsGrow
    }

    return resizeVertices(curve, sizeX*scale, sizeY*scale)
  }

  getOptions() {
    return options
  }
}
