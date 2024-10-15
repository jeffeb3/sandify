import {
  resizeVertices,
  dimensions,
  centerOnOrigin,
  findBounds,
} from "@/common/geometry"
import Effect from "./Effect"

const options = {}

export default class Transformer extends Effect {
  constructor() {
    super("transformer")
    this.dragPreview = true
    this.label = "Move and resize"
    this.randomizable = false
  }

  canMove(state) {
    return true
  }

  canRotate(state) {
    return true
  }

  canChangeSize(state) {
    return true
  }

  getInitialState(layer, layerVertices) {
    if (layerVertices) {
      // reverse rotation before calculating bounds
      const vertices = [...layerVertices]
      vertices.forEach((vertex) => {
        vertex.rotateDeg(layer.rotation)
      })

      const bounds = findBounds(layerVertices)
      const { width, height } = dimensions(vertices)
      const offsetX = (bounds[1].x + bounds[0].x) / 2
      const offsetY = (bounds[1].y + bounds[0].y) / 2

      return {
        ...super.getInitialState(),
        ...{
          type: "transformer",
          width,
          height,
          x: offsetX - layer.x,
          y: offsetY - layer.y,
        },
      }
    } else {
      // imported; values will be supplied
      return {
        ...super.getInitialState(),
        ...{
          type: "transformer",
          width: 0,
          height: 0,
          x: 0,
          y: 0,
        },
      }
    }
  }

  getVertices(effect, layer, vertices) {
    this.state = effect
    this.effect = effect
    this.vertices = [...vertices]

    resizeVertices(this.vertices, effect.width, effect.height, true)
    centerOnOrigin(this.vertices)
    this.transform()

    return vertices
  }

  transform() {
    const { x, y, rotation } = this.state

    this.vertices.forEach((vertex) => {
      vertex.rotateDeg(-rotation)
      vertex.addX({ x }).addY({ y })
    })
  }

  getOptions() {
    return options
  }
}
