import { createSlice } from "@reduxjs/toolkit"
import { createSelector } from "reselect"
import { downloadFile } from "@/common/util"
import { selectState } from "@/features/app/appSlice"
import SandifyExporter from "./SandifyExporter"
import i18next from 'i18next'


export const fileOptions = () => ({
    fileName: {
      title: i18next.t('fileDownloader.fileName'),
      type: "string",
    },
  })

// ------------------------------
// Slice, reducers and atomic actions
// ------------------------------

const fileSlice = createSlice({
  name: "file",
  initialState: {
    fileName: "sandify",
  },
  reducers: {
    updateFile(state, action) {
      Object.assign(state, action.payload)
    },
  },
})

export const { updateFile } = fileSlice.actions
export default fileSlice.reducer

// ------------------------------
// Selectors
// ------------------------------

export const selectFileState = createSelector(
  selectState,
  (state) => state.file,
)

// ------------------------------
// Compound actions (thunks)
// ------------------------------
export const download = (fileName) => {
  return (dispatch, getState) => {
    const state = getState()
    const exporter = new SandifyExporter()
    downloadFile(fileName, exporter.export(state), "text/plain;charset=utf-8")
  }
}
