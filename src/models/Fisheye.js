import Victor from 'victor'
import Effect from './Effect'
import { shapeOptions } from './Shape'
import { circle } from '../common/geometry'
import * as d3Fisheye from 'd3-fisheye'

const options = {
  ...shapeOptions,
  ...{
    fisheyeDistortion: {
      title: 'Distortion',
      min: 1,
      max: 40,
      step: 0.1,
    }
  }
}

export default class Fisheye extends Effect {
  constructor() {
    super('Fisheye')
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        type: 'fisheye',
        selectGroup: 'effects',
        fisheyeDistortion: 3,
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
    const fisheye = d3Fisheye.radial()
      .radius(effect.startingWidth/2)
      .distortion(effect.fisheyeDistortion/2)
    fisheye.focus([effect.offsetX, effect.offsetY]);

    return vertices.map(vertex => {
      const warped = fisheye([vertex.x, vertex.y])
      return new Victor(warped[0], warped[1])
    })
  }

  getOptions() {
    return options
  }
}
