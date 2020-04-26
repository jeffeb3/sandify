const exporterOptions = {
  fileName: {
    title: 'File name',
    type: 'string'
  },
  fileType: {
    title: 'Export as',
    type: 'dropdown',
    choices: ['GCode (.gcode)', 'Theta Rho (.thr)']
  },
  post: {
    title: 'Program end code',
    type: 'textarea'
  },
  pre: {
    title: 'Program start code',
    type: 'textarea'
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
