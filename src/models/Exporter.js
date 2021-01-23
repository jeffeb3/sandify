
export const gcodeTypeName = 'GCode (.gcode)'
export const thrTypeName = 'Theta Rho (.thr)'
export const svgTypeName = 'SVG (.svg)'

const exporterOptions = {
  fileName: {
    title: 'File name',
    type: 'string'
  },
  fileType: {
    title: 'Export as',
    type: 'dropdown',
    choices: [gcodeTypeName, thrTypeName, svgTypeName]
  },
  polarRhoMax: {
    title: 'Maximum rho value (0-1)',
    min: 0,
    max: 1
  },
  scaraGcode: {
    title: 'Scara GCode',
  },
  post: {
    title: 'Program end code',
    type: 'textarea',
    isVisible: (state) => { return state.fileType !== svgTypeName },
  },
  pre: {
    title: 'Program start code',
    type: 'textarea',
    isVisible: (state) => { return state.fileType !== svgTypeName },
  },
  reverse: {
    title: 'Reverse path in the code',
  },
}

export class Exporter {
  getOptions() {
    return exporterOptions
  }
}
