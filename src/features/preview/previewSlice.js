import { createSlice } from "@reduxjs/toolkit"
import { createSelector } from "reselect"
import { selectState } from "@/features/app/appSlice"

// ------------------------------
// Slice, reducers and atomic actions
// ------------------------------

const previewSlice = createSlice({
  name: "preview",
  initialState: {
    canvasWidth: 600,
    canvasHeight: 600,
    sliderValue: 0.0,
    zoom: 1.0,
    drawingMode: false,
    drawingPoints: [],
  },
  reducers: {
    updatePreview(state, action) {
      Object.assign(state, action.payload)
    },
    setPreviewSize(state, action) {
      state.canvasHeight = action.payload.height
      state.canvasWidth = action.payload.width
    },
    toggleDrawingMode(state) {
      state.drawingMode = !state.drawingMode
      state.drawingPoints = []
    },
    exitDrawingMode(state) {
      state.drawingMode = false
      state.drawingPoints = []
    },
    addDrawingPoint(state, action) {
      state.drawingPoints.push(action.payload)
    },
    clearDrawingPoints(state) {
      state.drawingPoints = []
    },
  },
})

export const {
  updatePreview,
  setPreviewSize,
  toggleDrawingMode,
  exitDrawingMode,
  addDrawingPoint,
  clearDrawingPoints,
} = previewSlice.actions
export default previewSlice.reducer

// ------------------------------
// Selectors
// ------------------------------

export const selectPreviewState = createSelector(
  selectState,
  (state) => state.preview,
)

export const selectPreviewSliderValue = createSelector(
  selectPreviewState,
  (state) => state.sliderValue,
)

export const selectPreviewZoom = createSelector(
  selectPreviewState,
  (state) => state.zoom,
)

export const selectDrawingMode = createSelector(
  selectPreviewState,
  (state) => state.drawingMode ?? false,
)

export const selectDrawingPoints = createSelector(
  selectPreviewState,
  (state) => state.drawingPoints ?? [],
)
