const transformOptions = {
  startingSize: {
    title: 'Starting size',
    min: 1,
    isVisible: (state) => { return state.canChangeSize },
  },
  offsetX: {
    title: 'X offset',
  },
  offsetY: {
    title: 'Y offset',
  },
  rotation: {
    title: 'Rotate (degrees)'
  },
  connectionMethod: {
    title: 'Connect to next layer',
    type: 'dropdown',
    choices: ['line', 'along perimeter']
  },
  backtrackPct: {
    title: 'Backtrack at end (%)',
    min: 0,
    max: 100,
    step: 5
  },
  drawPortionPct: {
    title: 'Draw portion of path (%)',
    min: 0,
    max: 100,
    step: 5
  },
  rotateStartingPct: {
    title: 'Rotate starting point (%)',
    min: -100,
    max: 100,
    step: 5
  },
  reverse: {
    title: 'Reverse path',
    type: 'checkbox'
  },
  numLoops: {
    title: 'Number of loops',
    min: 1
  },
  transformMethod: {
    title: 'When transforming shape',
    type: 'dropdown',
    choices: ['smear', 'intact'],
  },
  growEnabled: {
    title: 'Grow'
  },
  growValue: {
    title: 'Scale (+/-)',
  },
  growMethod: {
    title: 'Scale by',
    type: 'dropdown',
    choices: ['constant', 'function']
  },
  growMathInput: {
    title: 'Scale function (i)',
    type: 'text',
    isVisible: state => { return state.growMethod === 'function' },
  },
  growMath: {
  },
  spinEnabled: {
    title: 'Spin',
    isVisible: state => { return state.growMethod === 'constant'},
  },
  spinValue: {
    title: 'Spin (+/-)',
    step: 0.1,
  },
  spinMethod: {
    title: 'Spin by',
    type: 'dropdown',
    choices: ['constant', 'function']
  },
  spinMathInput: {
    title: 'Spin function (i)',
    type: 'text',
    isVisible: state => { return state.spinMethod === 'function' },
  },
  spinMath: {
  },
  spinSwitchbacks: {
    title: 'Switchbacks',
    isVisible: state => { return state.spinMethod === 'constant'},
  },
  trackEnabled: {
    title: 'Track'
  },
  trackGrowEnabled: {
    title: 'Track grow'
  },
  rotateCompleteLoop: {
    title: 'Complete loop?'
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
    title: 'Scale step (+/-)',
  },
}

// used as a way to keep a shape's transform settings separate. Actual state
// is stored on Shape.
export default class Transform {
  getOptions() {
    return transformOptions
  }
}
