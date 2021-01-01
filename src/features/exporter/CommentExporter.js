import { getShape } from '../../models/shapes'
import { getLayerInfo } from '../layers/selectors'
import Machine from '../../models/Machine'
import Transform from '../../models/Transform'
import Exporter from './Exporter'

export default class CommentExporter extends Exporter {
  constructor(props) {
    super(props)
    this.indentLevel = 0
    this.startComments()
    this.commentChar = ''
  }

  export() {
    const state = this.props
    const machine = new Machine()
    const transform = new Transform()
    let instance = state.machine

    this.line('Created by Sandify')
    this.line('https://sandify.org')
    this.keyValueLine('Version', state.app.sandifyVersion)
    this.line()

    this.keyValueLine('Machine type', state.machine.rectangular ? 'Rectangular' : 'Polar')
    this.indent()
    this.optionLines(machine, instance, ['minX', 'maxX', 'minY', 'maxY'], state.machine.rectangular)
    this.optionLines(machine, instance,  ['maxRadius', 'polarStartPoint', 'polarEndPoint'], !state.machine.rectangular)
    this.dedent()

    this.keyValueLine('Content type', state.app.input)

    switch (state.app.input) {
      case 'shape': // shapes
        const layers = getLayerInfo(state)
        layers.forEach(layer => {
          const shape = getShape(layer)
          const options = shape.getOptions()

          this.line('Layer:')
          this.indent()
          this.keyValueLine('Shape', shape.name)
          this.optionLines(shape, layer, Object.keys(options))
          this.keyValueLine('Visible', layer.visible)
          this.optionLines(transform, layer, ['startingWidth', 'startingHeight', 'offsetX', 'offsetY', 'rotation', 'reverse'])
          this.optionLines(transform, layer, ['numLoops', 'transformMethod'], layer.repeatEnabled)

          this.optionLine(transform, layer, 'growEnabled', layer.repeatEnabled)
          this.indent()
          this.optionLine(transform, layer, 'growValue', layer.repeatEnabled && layer.growEnabled)
          this.optionLine(transform, layer, 'growMethod', layer.repeatEnabled && layer.growEnabled)
          this.indent()
          this.optionLine(transform, layer, 'growMath', layer.repeatEnabled && layer.growEnabled && layer.growMethod === 'function')
          this.dedent()
          this.dedent()

          this.optionLine(transform, layer, 'spinEnabled', layer.repeatEnabled)
          this.indent()
          this.optionLines(transform, layer, ['spinValue', 'spinMethod'], layer.repeatEnabled && layer.spinEnabled)
          this.indent()
          this.optionLine(transform, layer, 'spinMath', layer.repeatEnabled && layer.spinEnabled && layer.spinMethod === 'function')
          this.optionLine(transform, layer, 'spinSwitchbacks', layer.repeatEnabled && layer.spinEnabled && layer.spinMethod === 'constant')
          this.dedent()
          this.dedent()

          this.optionLine(transform, layer, 'trackEnabled', layer.repeatEnabled)
          this.indent()
          this.optionLines(transform, layer, ['trackValue', 'trackLength', 'trackNumLoops'], layer.repeatEnabled && layer.trackEnabled)
          this.optionLine(transform, layer, 'trackGrowEnabled', layer.repeatEnabled && layer.trackEnabled)
          this.indent()
          this.optionLine(transform, layer, 'trackGrow', layer.repeatEnabled && layer.trackGrowEnabled)
          this.dedent()
          this.dedent()

          if (!layer.effect) {
            this.line('Fine tuning:')
            this.indent()
            this.optionLines(transform, layer, ['connectionMethod', 'drawPortionPct', 'backtrackPct', 'rotateStartingPct'])
            this.dedent()
          }
          this.dedent()
        })
        break

      default:
        break
    }

    this.dedent()
    this.keyValueLine('Reverse export path', state.exporter.reverse)
    return this.lines
  }
}
