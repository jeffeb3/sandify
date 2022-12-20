import { modelOptions } from '../Model'
import { arrayRotate } from '@/common/util'
import { circle } from '@/common/geometry'
import Effect from '../Effect'

const options = {
  ...modelOptions,
  ...{
    backtrackPct: {
      title: 'Backtrack at end (%)',
      min: 0,
      max: 100,
      step: 2
    },
    drawPortionPct: {
      title: 'Draw portion of path (%)',
      min: 0,
      max: 100,
      step: 2
    },
    rotateStartingPct: {
      title: 'Rotate starting point (%)',
      min: -100,
      max: 100,
      step: 2
    },
  }
}

export default class FineTuning extends Effect {
  constructor() {
    super('Fine Tuning')
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        // Inherited
        type: 'fineTuning',
        selectGroup: 'effects',
        canChangeSize: false,
        canRotate: false,
        canMove: false,
        effect: true,

        // Fine Tuning Options
        drawPortionPct: 100,
        backtrackPct: 0,
        rotateStartingPct: 0,
      }
    }
  }

  getVertices(state) {
    // TODO Make this more reasonable
    return circle(25)
  }

  applyEffect(effect, layer, vertices) {

    // Remove one point if we are smearing
    if (effect.transformMethod === 'smear') {
      vertices.pop()
    }

    let outputVertices = vertices

    if (effect.rotateStartingPct === undefined || effect.rotateStartingPct !== 0) {
      const start = Math.round(outputVertices.length * effect.rotateStartingPct / 100.0)
      outputVertices = arrayRotate(outputVertices, start)
    }

    if (effect.drawPortionPct !== undefined) {
      const drawPortionPct = Math.round((parseInt(effect.drawPortionPct) || 100)/100.0 * outputVertices.length)
      outputVertices = outputVertices.slice(0, drawPortionPct)
    }

    const backtrack = Math.round(vertices.length * effect.backtrackPct / 100.0)
    outputVertices = outputVertices.concat(outputVertices.slice(outputVertices.length - backtrack).reverse())

    return outputVertices
  }

  getOptions() {
    return options
  }
}
