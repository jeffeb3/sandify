import { createSlice } from "@reduxjs/toolkit"

const previewSlice = createSlice({
  name: 'preview',
  initialState: {
    canvasWidth: 600,
    canvasHeight: 600,
    sliderValue: 0.0,
    dragging: false
  },
  reducers: {
    updatePreview(state, action) {
      Object.assign(state, action.payload)
    },
    setPreviewSize(state, action) {
      state.canvasHeight = action.payload
      state.canvasWidth = action.payload
    },
  }
})

export const {
  updatePreview,
  setPreviewSize,
} = previewSlice.actions

export default previewSlice.reducer
