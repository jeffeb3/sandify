import { functionValue } from "@/common/util"
import { resizeVertices, dimensions, cloneVertices } from "@/common/geometry"
import { pick } from "lodash"
import { LRUCache } from "lru-cache"
import Model from "@/common/Model"

const cache = new LRUCache({
  length: (n, key) => {
    return n.length
  },
  max: 500000,
})

export default class Shape extends Model {
  constructor(type) {
    super(type)
    this.cache = []

    Object.assign(this, {
      selectGroup: "Shapes",
      shouldCache: true,
      autosize: true,
      startingWidth: 100,
      startingHeight: 100,
      maintainAspectRatio: false,
    })
  }

  // calculates the initial dimensions of the model
  initialDimensions(props) {
    const { width, height } = this.recalculateDimensions(
      props,
      this.startingWidth,
      this.startingHeight,
    )
    return {
      width,
      height,
      aspectRatio: width / height,
    }
  }

  recalculateDimensions(props, width, height) {
    if (this.autosize) {
      const vertices = this.initialVertices(props)

      resizeVertices(vertices, width, height, false)

      return dimensions(vertices)
    } else {
      return {
        width,
        height,
      }
    }
  }

  // returns an array of vertices used to calculate the initial width and height of a model
  initialVertices(props) {
    return this.getVertices({
      shape: this.getInitialState(props),
      creating: true,
    })
  }

  getCacheKey(state) {
    // include only model values in key
    const cacheState = { ...state }
    cacheState.shape = pick(cacheState.shape, [
      ...Object.keys(this.getOptions()),
      "imageId",
    ])
    cacheState.type = state.shape.type
    cacheState.dragging = state.shape.dragging

    return JSON.stringify(cacheState)
  }

  // override as needed; returns an array of Victor vertices that render
  // the shape with the specific options
  getVertices(state) {
    return []
  }

  getCachedVertices(state) {
    if (this.shouldCache) {
      const key = this.getCacheKey(state)
      let vertices = cache.get(key)

      if (!vertices) {
        vertices = this.getVertices(state)

        if (vertices.length > 1) {
          cache.set(key, vertices)
        }
      }

      // return a copy of these vertices even though it's coming from the cache, because
      // downstream logic is modifying them directly; it's the computation of the vertices
      // that can be expensive, not the copying.
      return cloneVertices(vertices)
    } else {
      return this.getVertices(state)
    }
  }

  // override as needed to do final vertex modifications after all layer transformations are
  // complete. Returns an array of vertices.
  finalizeVertices(vertices, state) {
    return vertices
  }

  // returns a hash of random changes for a given layer based on the shape
  // options
  randomChanges(layer, exclude = []) {
    const changes = { id: layer.id }
    const options = this.getOptions()

    Object.keys(options).forEach((key) => {
      if (!exclude.includes(key)) {
        const change = this.randomChange(key, layer, options)

        if (change != null) {
          changes[key] = change
        }
      }
    })

    return changes
  }

  randomChange(key, layer, options) {
    const settings = options[key]
    const random = settings.random == null ? 1 : settings.random
    const randomize = Math.random() <= random
    const type = settings.type

    if (type == "textarea") {
      // do nothing
    } else if (type == "checkbox") {
      const defaults = this.getInitialState()
      let value = defaults[key]

      if (random && Math.random() <= 0.5) {
        value = !value
      }

      return value
    } else if (type == "togglebutton" || type == "dropdown") {
      let choices = functionValue(settings.choices, layer)
      const choice = Math.floor(Math.random() * choices.length)

      return choices[choice]
    } else {
      const defaults = this.getInitialState()
      let min = settings.randomMin
      if (min == null) {
        min = functionValue(settings.min, layer) || 0
      }
      let max = settings.randomMax || functionValue(settings.max, layer)
      if (max == null) {
        max = defaults[key] * 3
      }
      const step = settings.step || 1

      if (randomize) {
        const random = Math.random() * (max - min) + min
        const precision = step >= 1 ? step : Math.round(1 / step)
        const value = Math.round(random * precision) / precision

        return value
      } else {
        return min
      }
    }
  }

  // override as needed; hook to modify updates to a layer before they affect the state
  handleUpdate(changes) {
    // default is to do nothing
  }
}
