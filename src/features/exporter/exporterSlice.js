import { createSlice } from "@reduxjs/toolkit"
import { GCODE, THETARHO, SVG } from "./Exporter"

const exporterSlice = createSlice({
  name: "exporter",
  initialState: {
    fileName: "sandify",
    fileType: GCODE,
    pre: "",
    post: "",
    reverse: false,
    polarRhoMax: 1.0,
    unitsPerCircle: 6.0,
  },
  reducers: {
    updateExporter(state, action) {
      Object.assign(state, action.payload)
    },
  },
})

export const { updateExporter } = exporterSlice.actions

export default exporterSlice.reducer
