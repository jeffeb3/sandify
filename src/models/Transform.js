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
  growMath: {
    title: 'Scale function (i)',
    type: 'text',
    isVisible: state => { return state.growMethod === 'function' },
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
  spinMath: {
    title: 'Spin function (i)',
    type: 'text',
    isVisible: state => { return state.spinMethod === 'function' },
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

export default class Transform {
  getInitialState() {
    return {
      startingSize: 10,
      offsetX: 0.0,
      offsetY: 0.0,
      numLoops: 10,
      transformMethod: 'smear',
      repeatEnabled: true,
      growMethod: 'constant',
      growMath: 'i+cos(i/2)',
      growEnabled: true,
      growValue: 100,
      spinMethod: 'constant',
      spinMath: '10*sin(i/4)',
      spinEnabled: false,
      spinValue: 2,
      spinSwitchbacks: 0,
      trackEnabled: false,
      trackGrowEnabled: false,
      trackValue: 10,
      trackLength: 0.2,
      trackNumLoops: 1,
      trackGrow: 50.0
    }
  }

  getOptions() {
    return transformOptions
  }
}
