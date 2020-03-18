import { createSlice } from "@reduxjs/toolkit"

const inputTextSlice = createSlice({
  name: 'inputText',
  reducers: {
    setShapeInputText(state, action) {
      state.input_text = action.payload
    },
    setShapeInputFont(state, action) {
      state.input_font = action.payload
    }
  }
})

export const {
  setShapeInputText,
  setShapeInputFont
} = inputTextSlice.actions

export default inputTextSlice.reducer
