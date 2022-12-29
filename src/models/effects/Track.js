import { modelOptions } from '../Model'
import Effect, { effectOptions } from '../Effect'
import { offset, rotate, circle } from '@/common/geometry'

const options = {
  ...modelOptions,
  ...{
    trackRadius: {
      title: 'Track radius',
    },
    trackRotations: {
      title: 'Track rotations'
    },
    trackSpiralEnabled: {
      title: 'Spiral track',
      type: 'checkbox',
    },
    trackSpiralRadius: {
      title: 'Spiral radius',
      isVisible: state => { return state.trackSpiralEnabled },
    },
  }
}

export default class Track extends Effect {
  constructor() {
    super('Track')
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        // Inherited
        type: 'track',

        // Track Options
        trackRadius: 10,
        trackRotations: 1,
        trackSpiralEnabled: false,
        trackSpiralRadius: 50.0,
      }
    }
  }

  getVertices(state) {
    // TODO Make this more reasonable
    return circle(25)
  }

  applyEffect(effect, layer, vertices) {

    let outputVertices = []

    for (var j=0; j<vertices.length; j++) {

      let transformedVertex = vertices[j]

      // Fraction of the complete track
      const completeFraction = j/vertices.length

      // Angle (in degrees) around the track
      const angleDeg = completeFraction*effect.trackRotations*360.0

      // Amount of distance to add to the offset
      let spiralValue = 0.0
      if (effect.trackSpiralEnabled) {
        spiralValue = (effect.trackSpiralRadius - effect.trackRadius) * completeFraction
      }

      transformedVertex = rotate(offset(transformedVertex, effect.trackRadius + spiralValue, 0.0), angleDeg)

      outputVertices.push(transformedVertex)
    }

    return outputVertices
  }

  getOptions() {
    return options
  }
}
