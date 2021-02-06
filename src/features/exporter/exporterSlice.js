import { createSlice } from '@reduxjs/toolkit'
import { GCODE, THETARHO, SVG } from '../../models/Exporter'

// Determine default file type; this is a little fussy because we want to ensure
// that if the user has a rectangular table, but somehow wants to export theta
// rho (or vice versa), we'll save that setting.
let fileType
if (localStorage.getItem('export_fileType')) {
  fileType = localStorage.getItem('export_fileType')

  // accommodate older type names
  if (fileType === 'GCode (.gcode)') {
    fileType = GCODE
  } else if (fileType === 'Theta Rho (.thr)') {
    fileType = THETARHO
  } else if (fileType === 'SVG (.svg)') {
    fileType = SVG
  }
} else if (localStorage.getItem('machine_rect_active')) {
  fileType = localStorage.getItem('machine_rect_active') ? GCODE : THETARHO
} else {
  fileType = GCODE
}

const exporterSlice = createSlice({
  name: 'exporter',
  initialState: {
    fileName: 'sandify',
    fileType: fileType,
    pre: localStorage.getItem('export_pre') ? localStorage.getItem('export_pre') : '',
    post: localStorage.getItem('export_post') ? localStorage.getItem('export_post') : '',
    reverse: false,
    show: false,
    polarRhoMax: 1.0
  },
  reducers: {
    updateExporter(state, action) {
      Object.assign(state, action.payload)
      Object.keys(action.payload).forEach(key => {
        localStorage.setItem("export_" + key, action.payload[key])
      })
    },
  }
})

export const {
  updateExporter
} = exporterSlice.actions

export default exporterSlice.reducer
