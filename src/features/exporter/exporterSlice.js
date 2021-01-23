import { createSlice } from '@reduxjs/toolkit'

// Determine default file type; this is a little fussy because we want to ensure
// that if the user has a rectangular table, but somehow wants to export theta
// rho (or vice versa), we'll save that setting.
let fileType
if (localStorage.getItem('export_fileType')) {
  fileType = localStorage.getItem('export_fileType')
} else if (localStorage.getItem('machine_rect_active')) {
  fileType = localStorage.getItem('machine_rect_active') ? 'GCode (.gcode)' : 'Theta Rho (.thr)'
} else {
  fileType = 'GCode (.gcode)'
}

const exporterSlice = createSlice({
  name: 'exporter',
  initialState: {
    fileName: 'sandify',
    fileType: fileType,
    pre: localStorage.getItem('export_pre') ? localStorage.getItem('export_pre') : '',
    post: localStorage.getItem('export_post') ? localStorage.getItem('export_post') : '',
    scaraGcode: localStorage.getItem('export_scaraGcode') ? localStorage.getItem('export_scaraGcode') === 'true' : false,
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
