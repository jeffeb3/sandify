import Victor from 'victor'
import Shape, { shapeOptions } from '../Shape'

let options = {
  ...shapeOptions,
  ...{
    fillerOrder: {
      title: 'Level',
      min: 1,
      max: (state) => {
        if (state.fillerType === 'Peano') {
          return 5
        } else {
          return 8
        }
      }
    },
    fillerType: {
      title: 'Type',
      type: 'dropdown',
      choices: ['Hilbert', 'Peano', 'Morton'],
      onChange: (attrs) => {
        if (attrs.fillerType === 'Peano') {
          // if we switch back to Peano with too high a fillerOrder, the code
          // will crash from recursion, so we'll set a ceiling
          attrs.fillerOrder = Math.max(attrs.fillerOrder || 1, 5)
        }
        return attrs
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

  // See https://thecodingtrain.com/CodingInTheCabana/003-hilbert-curve.html for basic idea.
  // Algorithm adapted from https://editor.p5js.org/simontiger/full/2CrT12N4
  getVertices(state) {
    const machine = state.machine
    const shape = state.shape
    const order = shape.fillerOrder || 1

    // feed our algorithm based on the specific space filling curve
    let grid, seed, rotation
    if (shape.fillerType === 'Hilbert') {
      grid = 2
      seed = [0, 2, 3, 1]
      rotation = [6, 7, 0, 0]
    } else if (shape.fillerType === 'Peano') {
      grid = 3
      seed = [0, 3, 6, 7, 4, 1, 2, 5, 8]
      rotation = [0, 5, 0, 4, 2, 4, 0, 5, 0]
    } else {
      grid = 2
      seed = [1, 0, 3, 2]
      rotation = [0, 0, 0, 0]
    }

    // create initial seed vertices that are sized to fill the entire machine area
    let size
    if (machine.rectangular) {
      size = Math.max(machine.maxY - machine.minY, machine.maxX - machine.minX)
    } else {
      size = machine.maxRadius * 2.0
    }
    size = size / grid

    let seedPoints = []
    for (let j = 0; j < grid; j++) {
      for (let i = 0; i < grid; i++) {
        seedPoints.push(new Victor(i*size + size/2, j*size + size/2))
      }
    }

    let seedPointsOrdered = []
    for (let i=0; i<seed.length; i++) {
      seedPointsOrdered.push(seedPoints[seed[i]])
    }

    // recursively generate our curve
    let curve = this.fillSpace(order, {
      seed: seed,
      seedPointsOrdered: seedPointsOrdered,
      grid: grid,
      rotation: rotation,
      size: size
    })

    return curve.map(vertex => vertex.add({x: -size*grid/2, y: -size*grid/2}))
  }

  getOptions() {
    return options
  }

  fillSpace(order, settings) {
    const {
      seed,
      seedPointsOrdered,
      grid,
      rotation,
      size
    } = settings

    if (order === 1) {
      return seedPointsOrdered
    }

    const prevOrder = this.fillSpace(order - 1, settings)
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
