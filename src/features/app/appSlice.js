import { createSlice } from "@reduxjs/toolkit"

const appSlice = createSlice({
  name: "app",
  initialState: {
    sandifyVersion: "0.2.8", // Also change the version in package.json.
  },
  reducers: {},
})

export default appSlice.reducer
