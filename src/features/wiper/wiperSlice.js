import { createSlice } from "@reduxjs/toolkit"

const wiperSlice = createSlice({
  name: 'wiper',
  initialState: {
    angle_deg: 15,
    size: 12,
  },
  reducers: {
    setWiperAngleDeg(state, action) {
      state.angle_deg = action.payload
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
