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
      repeatEnabled: true,
      canTransform: true,
      selectGroup: 'Shapes',
      shouldCache: true,
      canChangeSize: true,
      startingSize: 10,
      offsetX: 0.0,
      offsetY: 0.0,
      rotation: 0,
      numLoops: 10,
      transformMethod: 'smear',
      growEnabled: true,
      growValue: 100,
      growMethod: 'constant',
      growMath: 'i+cos(i/2)',
      spinEnabled: false,
      spinValue: 2,
      spinMethod: 'constant',
      spinMath: '10*sin(i/4)',
      spinSwitchbacks: 0,
      trackEnabled: false,
      trackGrowEnabled: false,
      trackValue: 10,
      trackLength: 0.2,
      trackNumLoops: 1,
      trackGrow: 50.0,
      dragging: false,
      visible: true
    }
  }

  getOptions() {
    return shapeOptions
  }

  getVertices(state) {
    return []
  }
}
