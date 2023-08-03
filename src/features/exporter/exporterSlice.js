import { createSlice } from "@reduxjs/toolkit"
import { createSelector } from "reselect"
import { selectAllLayers } from "@/features/layers/layersSlice"
import CommentExporter from "./CommentExporter"
import { log } from "@/common/debugging"
import { selectState, selectAppState } from "@/features/app/appSlice"
import { selectMachine } from "@/features/machine/machineSlice"
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

export const selectComments = createSelector(
  [selectAppState, selectAllLayers, selectExporterState, selectMachine],
  (app, layers, exporter, machine) => {
    log("selectComments")
    const state = {
      app,
      layers,
      exporter,
      machine,
    }

    return new CommentExporter(state).export()
  },
)
