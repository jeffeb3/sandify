import Shape, { shapeOptions } from '../Shape'
import {
  lsystem,
  lsystemPath,
  onSubtypeChange,
  onMinIterations,
  onMaxIterations
} from '../../common/lindenmayer'
import { subtypes } from './subtypes'
import { resizeVertices } from '../../common/geometry'

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
    },
  }
}

export default class LSystem extends Shape {
  constructor() {
    super('Fractal Line Writer')
    this.link = 'https://en.wikipedia.org/wiki/L-system'
    this.linkText = 'this Wikipedia article on L-systems'
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        type: 'lsystem',
        repeatEnabled: false,
        startingSize: 23,
        iterations: 3,
        subtype: 'McWorter\'s Pentadendrite'
      }
    }
  }

  getVertices(state) {
    const shape = state.shape
    const iterations = shape.iterations || 1
    const size = 8

    // generate our vertices using a set of l-system rules
    let config = subtypes[shape.subtype]
    config.iterations = iterations
    config.side = state.shape.startingSize/5

    if (config.angle === undefined) { config.angle = Math.PI/2 }

    let curve = lsystemPath(lsystem(config), config)

    return resizeVertices(curve, size, size)
  }

  getOptions() {
    return options
  }
}
