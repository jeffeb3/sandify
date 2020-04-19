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
      choices: [
        'Gosper (flowsnake)', 'Hilbert', 'Hilbert II', 'Morton', 'Peano',
        'Sierpinski', 'Sierpinski Square'],
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

  // Algorithm adapted from https://editor.p5js.org/simontiger/full/2CrT12N4
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

    let config = fillers[shape.fillerType]
    if (shape.fillerType === 'Morton') {
      // generate our vertices using space filling curve recursion
      config.sizeX = sizeX
      config.sizeY = sizeY
      return this.spaceFillingCurve(order, config)
    } else {
      // generate our vertices using a set of l-system rules
      let config = fillers[shape.fillerType]
      config.steps = order

      if (config.side === undefined) { config.side = 5 }
      if (config.angle === undefined) { config.angle = Math.PI/2 }

      let curve = lsystemPath(lsystem(config), config)
      let scale = config.orderGrow ? order : 1

      return resizeVertices(curve, sizeX*scale, sizeY*scale)
    }
  }

  getOptions() {
    return options
  }

  spaceFillingCurve(order, config) {
    // create initial seed vertices that are sized to fill the entire machine area
    let size = Math.max(config.sizeX, config.sizeY) / config.grid
    let seedPoints = []
    let seedPointsOrdered = []

    for (let j = 0; j < config.grid; j++) {
      for (let i = 0; i < config.grid; i++) {
        seedPoints.push(new Victor(i*size + size/2, j*size + size/2))
      }
    }

    for (let i=0; i<config.seed.length; i++) {
      seedPointsOrdered.push(seedPoints[config.seed[i]])
    }

    config.seedPointsOrdered = seedPointsOrdered
    config.size = size

    // recursively generate our curve
    let curve = this.fillSpace(order, config)
    return curve.map(vertex => vertex.add({x: -size*config.grid/2, y: -size*config.grid/2}))
  }

  // Algorithm adapted from https://editor.p5js.org/simontiger/full/2CrT12N4
  // Needed at the moment only for the Morton curve because I could not find
  // L-system rules to define one.
  fillSpace(order, config) {
    const {
      seed,
      seedPointsOrdered,
      grid,
      rotation,
      size
    } = config

    if (order === 1) {
      return seedPointsOrdered
    }

    const prevOrder = this.fillSpace(order - 1, config)
    let copies = []

    for (let j=0; j<grid; j++) {
      for (let i=0; i<grid; i++) {
        copies.push(prevOrder.map(v => new Victor(v.x/grid + i*size, v.y/grid + j*size)))
      }
    }

    for (let j=0; j<grid; j++) {
      for (let i=0; i<grid; i++) {
        const refX = i*size + size/2
        const refY = j*size + size/2

        if (rotation[i+j*grid] === 1) {
          copies[i+j*grid] = copies[i+j*grid].map(v => new Victor(refY-v.y+refX, v.x-refX+refY))
        } else if (rotation[i+j*grid] === 2) {
          copies[i+j*grid] = copies[i+j*grid].map(v => new Victor(2*refX - v.x, 2*refY - v.y))
        } else if (rotation[i+j*grid] === 3) {
          copies[i+j*grid] = copies[i+j*grid].map(v => new Victor(v.y-refY+refX, refX-v.x+refY))
        } else if (rotation[i+j*grid] === 4) {
          copies[i+j*grid] = copies[i+j*grid].map(v => new Victor(2*refX - v.x, v.y))
        } else if (rotation[i+j*grid] === 5) {
          copies[i+j*grid] = copies[i+j*grid].map(v => new Victor(v.x, 2*refY - v.y))
        } else if (rotation[i+j*grid] === 6) {
          copies[i+j*grid] = copies[i+j*grid].map(v => new Victor(v.y-refY+refX, v.x-refX+refY))
        } else if (rotation[i+j*grid] === 7) {
          copies[i+j*grid] = copies[i+j*grid].map(v => new Victor(refY-v.y+refX, refX-v.x+refY))
        }
      }
    }

    const res = []
    for (let i=0; i < seed.length; i++) {
      res.push(...copies[seed[i]])
    }
    return res
  }
}
