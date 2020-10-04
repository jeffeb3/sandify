import { createSlice } from '@reduxjs/toolkit'

const importerSlice = createSlice({
  name: 'importer',
  initialState: {
    showImportPattern: false,
    showImportImage: false,
    showImagePreview: false,
    reverseImageIntensity: false,
    imageThreshold: 127,
  },
  reducers: {
    showImportPattern(state, action) {
      state.showImportPattern = action.payload
    },
    showImportImage(state, action) {
      state.showImportImage = action.payload
    },
    showImagePreview(state, action) {
      state.showImagePreview = action.payload
    },
    setReverseImageIntensity(state, action) {
      state.reverseImageIntensity = action.payload
    },
    setImageThreshold(state, action) {
      state.imageThreshold = action.payload
    },
  }
})

export const {
  showImportPattern,
  showImportImage,
  showImagePreview,
  setReverseImageIntensity,
  setImageThreshold,
} = importerSlice.actions

export default importerSlice.reducer
