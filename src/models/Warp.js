import Victor from 'victor'
import Effect from './Effect'
import { shapeOptions } from './Shape'
import { circle, subsample } from '../common/geometry'
import { evaluate } from 'mathjs'

const options = {
  ...shapeOptions,
  ...{
    warpType: {
      title: 'Warp type',
      type: 'dropdown',
      choices: ['angle', 'quad', 'circle', 'grid', 'shear', 'custom'],
      onChange: (changes, attrs) => {
        changes.canChangeSize = changes.warpType !== 'custom'
        if (['angle', 'quad', 'shear'].includes(changes.warpType)) {
          changes.rotation = changes.warpType === 'shear' ? 0 : 45
          changes.canRotate = true
        } else {
          changes.rotation = 0
          changes.canRotate = false
        }

        return changes
      }
    },
    period: {
      title: 'Period',
      step: 0.2,
      isVisible: (state) => { return !['custom', 'shear'].includes(state.warpType) },
    },
    xMathInput: {
      title: 'X(x,y)',
      delayKey: 'xMath',
      type: 'text',
      isVisible: (state) => { return state.warpType === 'custom' },
    },
    yMathInput: {
      title: 'Y(x,y)',
      delayKey: 'yMath',
      type: 'text',
      isVisible: (state) => { return state.warpType === 'custom' },
    },
    subsample: {
      title: 'Subsample points',
      type: 'checkbox',
    },
  }
}

export default class Warp extends Effect {
  constructor() {
    super('Warp')
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        type: 'warp',
        selectGroup: 'effects',
        warpType: 'angle',
        period: 10.0,
        subsample: true,
        xMathInput: 'x + 4*sin((x+y)/20)',
        xMath: 'x + 4*sin((x+y)/20)',
        yMathInput: 'y + 4*sin((x-y)/20)',
        yMath: 'y + 4*sin((x-y)/20)',
        startingWidth: 40,
        startingHeight: 40,
        rotation: 45,
        canRotate: true,
        canChangeHeight: false
      }
    }
  }

  getVertices(state) {
    const width = state.shape.startingWidth
    return circle(width/2)
  }

  applyEffect(effect, layer, vertices) {
    if (effect.subsample) {
      vertices = subsample(vertices, 2.0)
    }

    if (effect.warpType === 'angle' || effect.warpType === 'quad') {
      return this.angle(effect.warpType === 'angle' ? +1.0 : -1.0, effect, vertices)
    } else if (effect.warpType === 'circle') {
      return this.circle(effect, vertices)
    } else if (effect.warpType === 'grid') {
      return this.grid(effect, vertices)
    } else if (effect.warpType === 'shear') {
      return this.shear(effect, vertices)
    } else if (effect.warpType === 'custom') {
      return this.custom(effect, vertices)
    }

    return vertices
  }

  angle(ySign, effect, vertices) {
    const periodx = 10.0 * effect.period / (Math.PI * 2.0) / Math.cos(-effect.rotation / 180.0 * Math.PI)
    const periody = 10.0 * effect.period / (Math.PI * 2.0) / Math.sin(-effect.rotation / 180.0 * Math.PI)
    const scale = effect.startingWidth / 10.0

    return vertices.map(vertex => {
      const originalx = vertex.x - effect.offsetX
      const originaly = vertex.y - effect.offsetY
      const x = originalx + scale * Math.sin(originalx/periodx + originaly/periody)
      const y = originaly + scale * Math.sin(originalx/periodx + ySign * originaly/periody)
      return new Victor(x + effect.offsetX, y + effect.offsetY)
    })
  }

  circle(effect, vertices) {
    const periodx = 10.0 * effect.period / (Math.PI * 2.0)
    const periody = 10.0 * effect.period / (Math.PI * 2.0)
    const scale = effect.startingWidth / 10.0

    return vertices.map(vertex=> {
      const originalx = vertex.x - effect.offsetX
      const originaly = vertex.y - effect.offsetY
      const theta = Math.atan2(originaly,originalx)
      const x = originalx + scale * Math.cos(theta) * Math.cos(Math.sqrt(originalx*originalx + originaly*originaly)/periodx)
      const y = originaly + scale * Math.sin(theta) * Math.cos(Math.sqrt(originalx*originalx + originaly*originaly)/periody)
      return new Victor(x + effect.offsetX, y + effect.offsetY)
    })
  }

  grid(effect, vertices) {
    const periodx = 10.0 * effect.period / (Math.PI * 2.0)
    const periody = 10.0 * effect.period / (Math.PI * 2.0)
    const scale = effect.startingWidth / 10.0

    return vertices.map(vertex => {
      const originalx = vertex.x - effect.offsetX
      const originaly = vertex.y - effect.offsetY
      const x = originalx + scale * Math.sin(originalx/periodx) * Math.sin(originaly/periody)
      const y = originaly + scale * Math.sin(originalx/periodx) * Math.sin(originaly/periody)
      return new Victor(x + effect.offsetX, y + effect.offsetY)
    })
  }

  shear(effect, vertices) {
    const shear = (effect.startingWidth - 1)/ 100
    const xShear = shear * Math.sin(effect.rotation / 180.0 * Math.PI)
    const yShear = shear * Math.cos(effect.rotation / 180.0 * Math.PI)
    return vertices.map(vertex => new Victor(vertex.x + xShear * vertex.y, vertex.y + yShear * vertex.x))
  }

  custom(effect, vertices) {
    return vertices.map(vertex => {
      try {
        const x = evaluate(effect.xMath, {x: vertex.x - effect.offsetX, y: vertex.y - effect.offsetY})
        const y = evaluate(effect.yMath, {x: vertex.x - effect.offsetX, y: vertex.y - effect.offsetY})
        return new Victor(x + effect.offsetX, y + effect.offsetY)
      }
      catch (err) {
        console.log("Error parsing custom effect: " + err)
        return vertex
      }
    })
  }

  getOptions() {
    return options
  }
}
