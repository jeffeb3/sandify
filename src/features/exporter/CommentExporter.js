import { getModelFromType } from "@/config/models"
// import Machine from '@/models/Machine'
import Exporter from "./Exporter"

export default class CommentExporter extends Exporter {
  constructor(props) {
    super(props)
    this.indentLevel = 0
    this.startComments()
    this.commentChar = ""
  }

  export() {
    const state = this.props
    // TODO: fix
    // const machine = new Machine()
    // let instance = state.machine

    this.line("Created by Sandify")
    this.line("https://sandify.org")
    this.keyValueLine("Version", state.app.sandifyVersion)
    this.line()

    this.keyValueLine(
      "Machine type",
      state.machine.rectangular ? "Rectangular" : "Polar",
    )
    this.indent()
    // TODO: fix
    // this.optionLines(machine, instance, ['minX', 'maxX', 'minY', 'maxY'], state.machine.rectangular)
    // this.optionLines(machine, instance,  ['maxRadius', 'polarStartPoint', 'polarEndPoint'], !state.machine.rectangular)
    this.dedent()

    this.keyValueLine("Content type", state.app.input)

    const layers = state.layers
    switch (state.app.input) {
      case "shape": // shapes
        layers.forEach((layer) => {
          const shape = getModelFromType(layer.type)
          const options = shape.getOptions()

          this.line("Layer:")
          this.indent()
          this.keyValueLine("Shape", shape.name)
          this.optionLines(shape, layer, Object.keys(options))
          this.keyValueLine("Visible", layer.visible)
          // TODO: fix
          // this.optionLines(transform, layer, ['width', 'height', 'x', 'y', 'rotation', 'reverse'])

          if (!layer.effect) {
            this.line("Fine tuning:")
            this.indent()
            // TODO: fix
            // this.optionLines(transform, layer, ['connectionMethod'])
            this.dedent()
          }
          this.dedent()
        })
        break

      default:
        break
    }

    this.dedent()
    this.keyValueLine("Reverse export path", state.exporter.reverse)
    return this.lines
  }
}
