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
    title: 'Scale step (+/-)',
  },
  spinEnabled: {
    title: 'Spin'
  },
  spinValue: {
    title: 'Spin step (+/-)',
    step: 0.1
  },
  spinSwitchbacks: {
    title: 'Switchbacks',
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
      growEnabled: true,
      growValue: 100,
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
