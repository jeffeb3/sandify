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
  backtrackPct: {
    title: 'Backtrack at end (%)',
    min: 0,
    max: 100,
    step: 2
  },
  drawPortionPct: {
    title: 'Draw portion of path (%)',
    min: 0,
    max: 100,
    step: 2
  },
  rotateStartingPct: {
    title: 'Rotate starting point (%)',
    min: -100,
    max: 100,
    step: 2
  },
  reverse: {
    title: 'Reverse path',
    type: 'checkbox',
    isVisible: (state) => { return !state.effect }
  },
  numLoops: {
    title: 'Number of loops',
    min: 1
  },
  trackEnabled: {
    title: 'Track'
  },
  trackGrowEnabled: {
    title: 'Scale track'
  },
  trackValue: {
    title: 'Track size',
  },
  trackNumLoops: {
    title: 'Number of loops at each track position',
    min: 1
  },
  trackLength: {
    title: 'Track length',
    step: 0.05
  },
  trackGrow: {
    title: 'Scale (+/-)',
  },
}

// used as a way to keep a shape's transform settings separate. Actual state
// is stored on Shape.
export default class Transform {
  getOptions() {
    return transformOptions
  }
}
