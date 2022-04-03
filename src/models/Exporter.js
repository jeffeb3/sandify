export const [GCODE, THETARHO, SVG, SCARA] = ['gcode', 'thetarho', 'svg', 'scara']
export const exportTypes = {
  'gcode': 'GCode',
  'thetarho': 'Theta Rho',
  'svg': 'SVG',
  'scara': 'SCARA GCode (experimental)'
}

const exporterOptions = {
  fileName: {
    title: 'File name',
    type: 'string'
  },
  fileType: {
    title: 'Export as',
    type: 'dropdown',
    choices: exportTypes
  },
  polarRhoMax: {
    title: 'Maximum rho value (0-1)',
    min: 0,
    max: 1
  },
  unitsPerCircle: {
    title: 'Units per circle',
    type: 'number',
  },
  post: {
    title: 'Program end code',
    type: 'textarea',
    isVisible: (state) => { return state.fileType !== SVG },
  },
  pre: {
    title: 'Program start code',
    type: 'textarea',
    isVisible: (state) => { return state.fileType !== SVG },
  },
  reverse: {
    title: 'Reverse path in the code',
  },
  pngPreview: {
    title: 'Export the preview image',
  },
}

export class Exporter {
  getOptions() {
    return exporterOptions
  }
}
