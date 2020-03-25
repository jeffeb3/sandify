import { createSlice } from "@reduxjs/toolkit"

const wiperSlice = createSlice({
  name: 'wiper',
  initialState: {
    angleDeg: 15,
    size: 12,
  },
  reducers: {
    setWiperAngleDeg(state, action) {
      state.angleDeg = action.payload
    },
    setWiperSize(state, action) {
      state.size = action.payload
    },
  }
})

export const {
  setWiperAngleDeg,
  setWiperSize
} = wiperSlice.actions

export default wiperSlice.reducer
