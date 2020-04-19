import { createSlice } from "@reduxjs/toolkit"

const fileSlice = createSlice({
  name: 'pattern import file',
  initialState: {
    name: "",
    comments: [],
    vertices: [],
    zoom: 100,
    originalAspectRatio: 1.0,
    aspectRatio: false,
  },
  reducers: {
    setFileVertices(state, action) {
      state.vertices = action.payload
    },
    setFileName(state, action) {
      state.name = action.payload
    },
    setFileComments(state, action) {
      state.comments = action.payload
    },
    setFileZoom(state, action) {
      state.zoom = action.payload
    },
    setFileOriginalAspectRatio(state, action) {
      state.originalAspectRatio = action.payload
    },
    toggleFileAspectRatio(state, action) {
      state.aspectRatio = !state.aspectRatio
    },
  }
})

export const {
  setFileVertices,
  setFileName,
  setFileComments,
  setFileZoom,
  setFileOriginalAspectRatio,
  toggleFileAspectRatio
} = fileSlice.actions

export default fileSlice.reducer
