import Victor from 'victor'
import { shapeOptions } from './Shape'
import Effect from './Effect'
import { rotate, offset, circle } from '../common/geometry'
import PolarMachine from '../features/machine/PolarMachine'
import RectMachine from '../features/machine/RectMachine'
import PolarInvertedMachine from '../features/machine/PolarInvertedMachine'
import RectInvertedMachine from '../features/machine/RectInvertedMachine'

const options = {
  ...shapeOptions,
  ...{
    maskMachine: {
      title: 'Mask shape',
      type: 'dropdown',
      choices: ['rectangle', 'circle'],
      onChange: (changes, attrs) => {
        if (changes.maskMachine === 'circle') {
          changes.rotation = 0

          const size = Math.min(attrs.startingWidth, attrs.startingHeight)
          changes.startingHeight = size
          changes.startingWidth = size
          changes.canRotate = false
          changes.canChangeHeight = false
        } else {
          changes.canRotate = true
          changes.canChangeHeight = true
        }

        return changes
      }
    },
    maskMinimizeMoves: {
      title: 'Try to minimize perimeter moves',
      type: 'checkbox'
    },
    maskInvert: {
      title: 'Invert',
      type: 'checkbox'
    },
    maskBorder: {
      title: 'Draw border',
      type: 'checkbox'
    }
  }
}

export default class Mask extends Effect {
  constructor() {
    super('Mask')
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        type: 'mask',
        selectGroup: 'effects',
        startingWidth: 100,
        startingHeight: 100,
        maskMinimizeMoves: false,
        maskMachine: 'rectangle',
        maskBorder: false,
        maskInvert: false
      }
    }
  }

  getVertices(state) {
    const width = state.shape.startingWidth
    const height = state.shape.startingHeight

    if (state.shape.dragging && state.shape.maskMachine === 'circle') {
      return circle(width/2)
    } else {
      return [
        new Victor(-width/2, height/2),
        new Victor(width/2, height/2),
        new Victor(width/2, -height/2),
        new Victor(-width/2, -height/2),
        new Victor(-width/2, height/2),
      ]
    }
  }

  applyEffect(effect, layer, vertices) {
    vertices = vertices.map(vertex => {
      return rotate(offset(vertex, -effect.offsetX, -effect.offsetY), effect.rotation)
    })

    if (!layer.dragging && !effect.dragging) {
      const machineClass = effect.maskMachine === 'circle' ?
        (effect.maskInvert ? PolarInvertedMachine : PolarMachine) :
        (effect.maskInvert ? RectInvertedMachine : RectMachine)

      const machine = new machineClass(
        vertices,
        { minX: 0, maxX: effect.startingWidth, minY: 0, maxY: effect.startingHeight, minimizeMoves: effect.maskMinimizeMoves, maxRadius: effect.startingWidth/2, perimeterConstant: effect.maskPerimeterConstant, mask: true },
        { border: effect.maskBorder })
      vertices = machine.polish().vertices
    }

    return vertices.map(vertex => {
      return offset(rotate(vertex, -effect.rotation), effect.offsetX, effect.offsetY)
    })
  }

  getOptions() {
    return options
  }
}
