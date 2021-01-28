import Victor from 'victor'
import Effect from './Effect'
import { shapeOptions } from './Shape'
import { circle, distance, subsample } from '../common/geometry'

const options = {
  ...shapeOptions,
  ...{
    warpType: {
      title: 'Warp Type',
      type: 'dropdown',
      choices: ['angle', 'quad', 'circle'],
      onChange: (changes, attrs) => {
        if (changes.warpType === 'circle') {
          changes.rotation = 45
          changes.canRotate = false
        } else {
          changes.canRotate = true
        }

        return changes
      }
    },
    period: {
      title: 'Period',
      step: 0.2
    },
    scale: {
      title: 'Scale',
      step: 0.1
    },
    subsample: {
      title: 'Subsample Points',
      type: 'checkbox',
    },
    useBounds: {
      title: 'Use Bounding Circle',
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
        scale: 4.0,
        period: 10.0,
        subsample: true,
        useBounds: false,
        startingWidth: 100,
        startingHeight: 100,
        rotation: 45,
        canRotate: true,
        canChangeHeight: false
      }
    }
  }

  getVertices(state) {
    const width = state.shape.startingWidth
    return circle(width/2, 0)
  }

  applyEffect(effect, layer, vertices) {
    let subsamples = vertices
    if (effect.subsample) {
      subsamples = subsample(vertices, 2.0)
    }

    if (effect.warpType === 'angle' || effect.warpType === 'quad') {
      const periodx = 10.0 * effect.period / (Math.PI * 2.0) / Math.cos(-effect.rotation / 180.0 * Math.PI)
      const periody = 10.0 * effect.period / (Math.PI * 2.0) / Math.sin(-effect.rotation / 180.0 * Math.PI)
      const ySign = effect.warpType === 'angle' ? +1.0 : -1.0
      return subsamples.map(vertex => {
        if (effect.useBounds) {
          const center = new Victor(effect.offsetX, effect.offsetY)
          if (distance(vertex, center) > 0.5*effect.startingWidth) {
            return vertex
          }
        }
        const originalx = vertex.x - effect.offsetX
        const originaly = vertex.y - effect.offsetY
        const x = originalx + effect.scale * Math.sin(originalx/periodx + originaly/periody)
        const y = originaly + effect.scale * Math.sin(originalx/periodx + ySign * originaly/periody)
        return new Victor(x + effect.offsetX, y + effect.offsetY)
      })
    }
    if (effect.warpType === 'circle') {
      const periodx = 10.0 * effect.period / (Math.PI * 2.0)
      const periody = 10.0 * effect.period / (Math.PI * 2.0)
      return subsamples.map(vertex=> {
        if (effect.useBounds) {
          const center = new Victor(effect.offsetX, effect.offsetY)
          if (distance(vertex, center) > 0.5*effect.startingWidth) {
            return vertex
          }
        }
        const originalx = vertex.x - effect.offsetX
        const originaly = vertex.y - effect.offsetY
        const theta = Math.atan2(originaly,originalx)
        const x = originalx + effect.scale * Math.cos(theta) * Math.cos(Math.sqrt(originalx*originalx + originaly*originaly)/periodx)
        const y = originaly + effect.scale * Math.sin(theta) * Math.cos(Math.sqrt(originalx*originalx + originaly*originaly)/periody)
        return new Victor(x + effect.offsetX, y + effect.offsetY)
      })
    }
    return vertices
  }

  getOptions() {
    return options
  }
}
