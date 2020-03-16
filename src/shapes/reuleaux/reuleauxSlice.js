import { createSlice } from "@reduxjs/toolkit"

const reuleauxSlice = createSlice({
  name: 'reuleaux',
  reducers: {
    setShapeReuleauxSides(state, action) {
      state.reuleaux_sides = action.payload
    }
  }
})

export const {
  setShapeReuleauxSides
} = reuleauxSlice.actions

export default reuleauxSlice.reducer
