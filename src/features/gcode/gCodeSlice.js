import { createSlice } from "@reduxjs/toolkit"

const gCodeSlice = createSlice({
  name: 'gcode',
  initialState: {
    filename: "sandify",
    pre: localStorage.getItem('gcode_pre') ? localStorage.getItem('gcode_pre') : '',
    post: localStorage.getItem('gcode_post') ? localStorage.getItem('gcode_post') : '',
    reverse: false,
    show: false
  },
  reducers: {
    setGCodeFilename(state, action) {
      state.filename = action.payload
    },
    setGCodePre(state, action) {
      state.pre = action.payload
      localStorage.setItem('gcode_pre', state.pre)
    },
    setGCodePost(state, action) {
      state.post = action.payload
      localStorage.setItem('gcode_post', state.post)
    },
    setGCodeShow(state, action) {
      state.show = action.payload
    },
    toggleGCodeReverse(state, action) {
      state.reverse = !state.reverse
    },
  }
})

export const {
  setGCodeFilename,
  setGCodePre,
  setGCodePost,
  setGCodeShow,
  toggleGCodeReverse,
} = gCodeSlice.actions

export default gCodeSlice.reducer
