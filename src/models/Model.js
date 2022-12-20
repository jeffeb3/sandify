export const modelOptions = {
  name: {
    title: 'Name',
    type: 'text'
  },
  startingWidth: {
    title: 'Initial width',
    min: 1,
    isVisible: (state) => { return state.canChangeSize },
    onChange: (changes, attrs) => {
      if (!attrs.canChangeHeight) {
        changes.startingHeight = changes.startingWidth
      }
      return changes
    }
  },
  startingHeight: {
    title: 'Initial height',
    min: 1,
    isVisible: (state) => { return state.canChangeSize && state.canChangeHeight },
  },
  offsetX: {
    title: 'X offset',
    isVisible: (state) => { return state.canMove }
  },
  offsetY: {
    title: 'Y offset',
    isVisible: (state) => { return state.canMove }
  },
  reverse: {
    title: 'Reverse path',
    type: 'checkbox',
    isVisible: (state) => { return !state.effect }
  },
  rotation: {
    title: 'Rotate (degrees)',
    isVisible: state => { return state.canRotate }
  },
}

export default class Model {
  constructor(name) {
    this.name = name
    this.cache = []
  }

  getInitialState() {
    return {
      shouldCache: true,
      autosize: true,
      canChangeSize: true,
      canChangeHeight: true,
      canRotate: true,
      canMove: true,
      usesMachine: false,
      usesFonts: false,
      startingWidth: 10,
      startingHeight: 10,
      offsetX: 0.0,
      offsetY: 0.0,
      rotation: 0,
      reverse: false,
      dragging: false,
      visible: true,
      effect: false
    }
  }

  getOptions() {
    return modelOptions
  }

  getVertices(state) {
    return []
  }

  draw(state) {
    const { startingWidth, startingHeight, autosize, offsetX, offsetY, rotation } = state.shape
    let vertices = this.getVertices(state)

    vertices.forEach(vertex => {
      if (autosize) {
        vertex.multiply({x: startingWidth, y: startingHeight})
      }

      vertex.rotateDeg(-rotation)
      vertex.addX({x: offsetX || 0}).addY({y: offsetY || 0})
    })

    return vertices
  }
}
