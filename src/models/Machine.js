const machineOptions = {
  minX: {
    title: 'Min X (mm)',
  },
  maxX: {
    title: 'Max X (mm)',
  },
  minY: {
    title: 'Min Y (mm)',
  },
  maxY: {
    title: 'Max Y (mm)',
  },
  origin: {
    title: 'Force origin'
  },
  maxRadius: {
    title: 'Max radius (mm)'
  },
  minimizeMoves: {
    title: 'Try to minimize perimeter moves',
    type: 'checkbox'
  },
  polarEndPoint: {
    title: 'End point'
  },
  polarStartPoint: {
    title: 'Start point'
  },
}

export default class Machine {
  getOptions() {
    return machineOptions
  }
}
