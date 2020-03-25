import { createSlice } from "@reduxjs/toolkit"

const appSlice = createSlice({
  name: 'app',
  initialState: {
    sandifyVersion: "0.1.8", // Also change the version in package.json.
    input: 'shape',
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
