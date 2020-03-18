import { createSlice } from "@reduxjs/toolkit"

const starSlice = createSlice({
  name: 'star',
  reducers: {
    setShapeStarPoints(state, action) {
      state.star_points = action.payload
    },
    setShapeStarRatio(state, action) {
      state.star_ratio = action.payload
    }
  }
})

export const {
  setShapeStarPoints,
  setShapeStarRatio
} = starSlice.actions

export default starSlice.reducer
