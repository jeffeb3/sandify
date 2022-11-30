const transformOptions = {
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
  rotation: {
    title: 'Rotate (degrees)',
    isVisible: state => { return state.canRotate }
  },
  connectionMethod: {
    title: 'Connect to next layer',
    choices: ['line', 'along perimeter']
  },
  reverse: {
    title: 'Reverse path',
    type: 'checkbox',
    isVisible: (state) => { return !state.effect }
  }
}

// used as a way to keep a shape's transform settings separate. Actual state
// is stored on Shape.
export default class Transform {
  getOptions() {
    return transformOptions
  }
}
