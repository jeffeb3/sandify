import { createSlice } from "@reduxjs/toolkit"

const appSlice = createSlice({
  name: "app",
  initialState: {
    sandifyVersion: "0.2.8", // Also change the version in package.json.
  },
  reducers: {},
})

export const selectState = (state) => state
export const selectAppState = (state) => state.app
export const selectAppVersion = (state) => state.app.sandifyVersion

export default appSlice.reducer
