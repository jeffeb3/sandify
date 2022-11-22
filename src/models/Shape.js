export const shapeOptions = {
  name: {
    title: 'Name',
    type: 'text'
  }
}

export default class Shape {
  constructor(name) {
    this.name = name
    this.cache = []
  }

  getInitialState() {
    return {
      canTransform: true,
      selectGroup: 'Shapes',
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
      open: true,
      rotation: 0,
      connectionMethod: 'line',
      drawPortionPct: 100,
      backtrackPct: 0,
      rotateStartingPct: 0,
      reverse: false,
      dragging: false,
      visible: true,
      effect: false
    }
  }

  getOptions() {
    return shapeOptions
  }

  getVertices(state) {
    return []
  }
}
