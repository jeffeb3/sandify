import { createSlice } from "@reduxjs/toolkit"

const hypocycloidSlice = createSlice({
  name: 'hypocycloid',
  reducers: {
    setShapeHypocycloidA(state, action) {
      state.hypocycloid_a = action.payload
    },
    setShapeHypocycloidB(state, action) {
      state.hypocycloid_b = action.payload
    }
  }
})

export const {
  setShapeHypocycloidA,
  setShapeHypocycloidB
} = hypocycloidSlice.actions

export default hypocycloidSlice.reducer
