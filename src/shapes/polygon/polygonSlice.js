import { createSlice } from "@reduxjs/toolkit"

const polygonSlice = createSlice({
  name: 'polygon',
  reducers: {
    setShapePolygonSides(state, action) {
      state.polygon_sides = action.payload
    }
  }
})

export const {
  setShapePolygonSides
} = polygonSlice.actions

export default polygonSlice.reducer
