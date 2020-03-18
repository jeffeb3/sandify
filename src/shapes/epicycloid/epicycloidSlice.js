import { createSlice } from "@reduxjs/toolkit"

const epicycloidSlice = createSlice({
  name: 'epicycloid',
  reducers: {
    setShapeEpicycloidA(state, action) {
      state.epicycloid_a = action.payload
    },
    setShapeEpicycloidB(state, action) {
      state.epicycloid_b = action.payload
    }
  }
})

export const {
  setShapeEpicycloidA,
  setShapeEpicycloidB
} = epicycloidSlice.actions

export default epicycloidSlice.reducer
