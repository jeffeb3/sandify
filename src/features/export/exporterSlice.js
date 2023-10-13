import { createSlice } from "@reduxjs/toolkit"
import { createSelector } from "reselect"
import { selectState } from "@/features/app/appSlice"
import { GCODE } from "./Exporter"

// ------------------------------
// Slice, reducers and atomic actions
// ------------------------------

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

// ------------------------------
// Selectors
// ------------------------------

export const selectExporterState = createSelector(
  selectState,
  (state) => state.exporter,
)
