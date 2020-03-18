import { createSlice } from "@reduxjs/toolkit"

const fileSlice = createSlice({
  name: 'theta rho file',
  initialState: {
    name: "",
    comments: [],
    vertices: [],
    zoom: 100,
    aspect_ratio: false,
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
    toggleFileAspectRatio(state, action) {
      state.aspect_ratio = !state.aspect_ratio
    },
  }
})

export const {
  setFileVertices,
  setFileName,
  setFileComments,
  setFileZoom,
  toggleFileAspectRatio
} = fileSlice.actions

export default fileSlice.reducer
