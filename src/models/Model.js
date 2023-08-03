import { resizeVertices, dimensions } from "@/common/geometry"
import { pick } from "lodash"
import LRUCache from "lru-cache"

const options = []
const cache = new LRUCache({
  length: (n, key) => {
    return n.length
  },
  max: 500000,
})

export default class Model {
  constructor(type) {
    this.type = type
    this.cache = []

    Object.assign(this, {
      selectGroup: "Shapes",
      shouldCache: true,
      autosize: true,
      canMove: true,
      usesMachine: false,
      usesFonts: false,
      dragging: false,
      effect: false,
      startingWidth: 100,
      startingHeight: 100,
      startingAspectRatioLocked: true,
    })
  }

  // calculates the initial dimensions of the model
  initialDimensions(props) {
    if (this.autosize) {
      const vertices = this.initialVertices(props)

      resizeVertices(
        vertices,
        this.startingWidth,
        this.startingHeight,
        this.startingAspectRatioLocked,
      )

      return dimensions(vertices)
    } else {
      return {
        width: this.startingWidth,
        height: this.startingHeight,
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

  // override as needed
  canChangeSize(state) {
    return true
  }

  // override as needed
  canChangeHeight(state) {
    return this.canChangeSize(state)
  }

  // override as needed
  canRotate(state) {
    return true
  }

  canTransform(state) {
    return this.canMove || this.canRotate(state) || this.canChangeSize(state)
  }

  // redux state of a newly created instance
  getInitialState() {
    return {}
  }

  getOptions() {
    return options
  }

  getCacheKey(state) {
    // include only model values in key
    const cacheState = { ...state }
    cacheState.shape = pick(cacheState.shape, Object.keys(this.getOptions()))

    return JSON.stringify(cacheState)
  }

  // override as needed; returns an array of Victor vertices
  getVertices(state) {
    return []
  }

  draw(state) {
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
      return vertices.map((vertex) => vertex.clone())
    } else {
      return this.getVertices(state)
    }
  }
}
