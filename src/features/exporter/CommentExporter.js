import { getShape } from '../shapes/selectors'
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
    this.indent()

    switch (state.app.input) {
      case 'shape': // shapes
        instance = state.shapes.byId[state.shapes.currentId]
        const shape = getShape(instance)
        const options = shape.getOptions()

        this.keyValueLine('Selected Shape', shape.name)
        this.optionLines(shape, instance, Object.keys(options))
        this.optionLines(transform, instance, ['offsetX', 'offsetY'])
        this.optionLines(transform, instance, ['numLoops', 'transformMethod', 'spinEnabled'], instance.repeatEnabled)
        this.indent()
        this.optionLines(transform, instance, ['spinValue', 'spinMethod'], instance.repeatEnabled && instance.spinEnabled)
        this.indent()
        this.optionLine(transform, instance, 'spinMath', instance.repeatEnabled && instance.spinEnabled && instance.spinMethod === 'function')
        this.optionLine(transform, instance, 'spinSwitchbacks', instance.repeatEnabled && instance.spinEnabled && instance.spinMethod === 'constant')
        this.dedent()
        this.dedent()
        this.optionLine(transform, instance, 'growEnabled', instance.repeatEnabled)
        this.indent()
        this.optionLine(transform, instance, 'growValue', instance.repeatEnabled && instance.growEnabled)
        this.optionLine(transform, instance, 'growMethod', instance.repeatEnabled && instance.growEnabled)
        this.indent()
        this.optionLine(transform, instance, 'growMath', instance.repeatEnabled && instance.growEnabled && instance.growMethod === 'function')
        this.dedent()
        this.dedent()
        this.optionLine(transform, instance, 'trackEnabled', instance.repeatEnabled)
        this.indent()
        this.optionLines(transform, instance, ['trackValue', 'trackLength', 'trackNumLoops'], instance.repeatEnabled && instance.trackEnabled)
        this.optionLine(transform, instance, 'trackGrowEnabled', instance.repeatEnabled && instance.trackEnabled)
        this.indent()
        this.optionLine(transform, instance, 'trackGrow', instance.repeatEnabled && instance.trackGrowEnabled)
        this.dedent()
        this.dedent()
        break

      case 'code':
        this.keyValueLine('Input file', state.importer.fileName)
        this.keyValueLine('Zoom', state.importer.zoom)
        this.keyValueLine('Aspect ratio', state.importer.aspectRatio)
        break

      default:
        break
    }

    this.dedent()
    this.keyValueLine('Path reversed', state.exporter.reverse)
    return this.lines
  }
}
