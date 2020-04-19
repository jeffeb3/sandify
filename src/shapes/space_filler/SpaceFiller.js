import Victor from 'victor'
import Shape, { shapeOptions } from '../Shape'
import { lsystem, lsystemPath } from '../../common/lindenmayer'
import { resizeVertices } from '../../common/geometry'
import { fillers } from './fillers'

const options = {
  ...shapeOptions,
  ...{
    fillerOrder: {
      title: 'Level',
      min: 1,
      max: (state) => {
        return (fillers[state.fillerType] && fillers[state.fillerType].maxOrder) || 7
      }
    },
    fillerType: {
      title: 'Fill type',
      type: 'dropdown',
      choices: Object.keys(fillers),
      onChange: (changes, attrs) => {
        // if we switch back with too high a fillerOrder, the code
        // will crash from recursion, so we'll set a ceiling where needed
        if (fillers[changes.fillerType]) {
          changes.fillerOrder = Math.min(attrs.fillerOrder || 1, fillers[changes.fillerType].maxOrder || 7)
        }
        return changes
      }
    },
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
        repeatEnabled: false,
        canTransform: false,
        startingSize: 1,
        canChangeSize: false,
        fillerOrder: 6,
        fillerType: 'Hilbert'
      }
    }
  }

  getVertices(state) {
    const machine = state.machine
    const shape = state.shape
    const order = shape.fillerOrder || 1

    let sizeX, sizeY
    if (machine.rectangular) {
      sizeX = machine.maxX - machine.minX
      sizeY = machine.maxY - machine.minY
    } else {
      sizeX = sizeY = machine.maxRadius * 2.0
    }

    // generate our vertices using a set of l-system rules
    let config = fillers[shape.fillerType]
    config.steps = order

    if (config.side === undefined) { config.side = 5 }
    if (config.angle === undefined) { config.angle = Math.PI/2 }

    let curve = lsystemPath(lsystem(config), config)
    let scale = config.orderGrow ? order : 1

    return resizeVertices(curve, sizeX*scale, sizeY*scale)
  }

  getOptions() {
    return options
  }
}
