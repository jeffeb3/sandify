const exporterOptions = {
  fileName: {
    title: 'File name',
    type: 'string'
  },
  fileType: {
    title: 'Export as',
    type: 'dropdown',
    choices: ['GCode (.gcode)', 'Theta Rho (.thr)', 'SVG (.svg)']
  },
  post: {
    title: 'Program end code',
    type: 'textarea',
    isVisible: (state) => { return state.fileType !== 'SVG (.svg)' },
  },
  pre: {
    title: 'Program start code',
    type: 'textarea',
    isVisible: (state) => { return state.fileType !== 'SVG (.svg)' },
  },
  reverse: {
    title: 'Reverse path in the code',
  },
}

export default class Exporter {
  getOptions() {
    return exporterOptions
  }
}
