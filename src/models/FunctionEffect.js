import Victor from 'victor'
import Effect from './Effect'
import { shapeOptions } from './Shape'
import { circle, distance, subsample } from '../common/geometry'
import { evaluate } from 'mathjs'

const options = {
  ...shapeOptions,
  ...{
    xMathInput: {
      title: 'X(x,y)',
      type: 'text',
    },
    yMathInput: {
      title: 'Y(x,y)',
      type: 'text',
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

export default class FunctionEffect extends Effect {
  constructor() {
    super('Function')
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        type: 'function',
        selectGroup: 'effects',
        xMathInput: 'x + 4*sin((x+y)/20)',
        yMathInput: 'y + 4*sin((x-y)/20)',
        subsample: true,
        useBounds: false,
        startingWidth: 100,
        startingHeight: 100,
        canRotate: false,
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

    return subsamples.map(vertex => {
      if (effect.useBounds) {
        const center = new Victor(effect.offsetX, effect.offsetY)
        if (distance(vertex, center) > 0.5*effect.startingWidth) {
          return vertex
        }
      }
      try {
        const x = evaluate(effect.xMathInput, {x: vertex.x - effect.offsetX, y: vertex.y - effect.offsetY})
        const y = evaluate(effect.yMathInput, {x: vertex.x - effect.offsetX, y: vertex.y - effect.offsetY})
        return new Victor(x + effect.offsetX, y + effect.offsetY)
      }
      catch (err) {
        console.log("Error parsing function effect: " + err)
        return vertex
      }
    })
  }

  getOptions() {
    return options
  }
}
