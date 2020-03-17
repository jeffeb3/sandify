import { createSlice } from "@reduxjs/toolkit"

const appSlice = createSlice({
  name: 'app',
  initialState: {
    sandify_version: "0.1.7", // Also change the version in package.json.
    input: 0,
  },
  reducers: {
    chooseInput(state, action) {
      state.input = action.payload
    },
  }
})

export const {
  chooseInput
} = appSlice.actions

export default appSlice.reducer
