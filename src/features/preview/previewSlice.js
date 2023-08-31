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
  },
  reducers: {
    updatePreview(state, action) {
      Object.assign(state, action.payload)
    },
    setPreviewSize(state, action) {
      state.canvasHeight = action.payload.height
      state.canvasWidth = action.payload.width
    },
  },
})

export const { updatePreview, setPreviewSize } = previewSlice.actions
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
