const transformOptions = {
  offsetX: {
    title: 'X offset',
  },
  offsetY: {
    title: 'Y offset',
  },
  numLoops: {
    title: 'Number of loops',
  },
  growValue: {
    title: 'Scale step (can be negative)',
  },
  spinValue: {
    title: 'Spin step (can be negative)',
    step: 0.1
  },
  spinSwitchbacks: {
    title: 'Switchbacks',
  },
  trackValue: {
    title: 'Track size',
  },
  trackLength: {
    title: 'Track length',
    step: 0.05
  },
  trackGrow: {
    title: 'Track scale step (can be negative)',
  },
}

export default class Transform {
  getInitialState() {
    return {
      startingSize: 10.0,
      offsetX: 0.0,
      offsetY: 0.0,
      numLoops: 10,
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
      trackGrow: 50.0
    }
  }

  getOptions() {
    return transformOptions
  }
}
