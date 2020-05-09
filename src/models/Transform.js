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
  growAdvanced: {
    title: 'Advanced',
    type: 'checkbox',
  },
  growMath: {
    title: 'Scale Function (i)',
    type: 'text',
    isVisible: state => { return state.growAdvanced },
  },
  growValue: {
    title: 'Scale step (+/-)',
  },
  spinAdvanced: {
    title: 'Advanced',
    type: 'checkbox',
  },
  spinMath: {
    title: 'Spin Function (i)',
    type: 'text',
    isVisible: state => { return state.spinAdvanced },
  },
  spinEnabled: {
    title: 'Spin',
    isVisible: state => { return !state.spinAdvanced },
  },
  spinValue: {
    title: 'Spin step (+/-)',
    step: 0.1,
    isVisible: state => { return !state.spinAdvanced },
  },
  spinSwitchbacks: {
    title: 'Switchbacks',
    isVisible: state => { return !state.spinAdvanced },
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
      growAdvanced: false,
      growMath: '4log(i+1)',
      growEnabled: true,
      growValue: 100,
      spinAdvanced: false,
      spinMath: '10*sin(i/2)',
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
