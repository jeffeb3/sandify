import { getShape } from '../../models/shapes'
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

    const layers = state.layers
    switch (state.app.input) {
      case 'shape': // shapes
        layers.forEach(layer => {
          const shape = getShape(layer)
          const options = shape.getOptions()

          this.line('Layer:')
          this.indent()
          this.keyValueLine('Shape', shape.name)
          this.optionLines(shape, layer, Object.keys(options))
          this.keyValueLine('Visible', layer.visible)
          this.optionLines(transform, layer, ['startingWidth', 'startingHeight', 'offsetX', 'offsetY', 'rotation', 'reverse'])

          if (!layer.effect) {
            this.line('Fine tuning:')
            this.indent()
            this.optionLines(transform, layer, ['connectionMethod'])
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
