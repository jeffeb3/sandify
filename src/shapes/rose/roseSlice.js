import { createSlice } from "@reduxjs/toolkit"

const roseSlice = createSlice({
  name: 'rose',
  reducers: {
    setShapeRoseN(state, action) {
      state.rose_n = action.payload
    },
    setShapeRoseD(state, action) {
      state.rose_d = action.payload
    }
  }
})

export const {
  setShapeRoseN,
  setShapeRoseD
} = roseSlice.actions

export default roseSlice.reducer
