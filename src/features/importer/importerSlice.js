import { createSlice } from '@reduxjs/toolkit'

const importerSlice = createSlice({
  name: 'importer',
  initialState: {
    fileName: '',
    comments: [],
    vertices: [],
    zoom: 100,
    originalAspectRatio: 1.0,
    aspectRatio: false,
  },
  reducers: {
    updateImporter(state, action) {
      Object.assign(state, action.payload)
    },
    toggleFileAspectRatio(state, action) {
      state.aspectRatio = !state.aspectRatio
    },
  }
})

export const {
  updateImporter,
  toggleFileAspectRatio
} = importerSlice.actions

export default importerSlice.reducer
