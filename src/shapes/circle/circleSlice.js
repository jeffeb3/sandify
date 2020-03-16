import { createSlice } from "@reduxjs/toolkit"

const circleSlice = createSlice({
  name: 'circle',
  reducers: {
    setShapeCircleLobes(state, action) {
      state.circle_lobes = action.payload
    }
  }
})

export const {
  setShapeCircleLobes
} = circleSlice.actions

export default circleSlice.reducer
