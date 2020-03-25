import { createSlice } from "@reduxjs/toolkit"

const shapesSlice = createSlice({
  name: 'shape',
  initialState: {
    currentId: null,
    byId: {},
    allIds: []
  },
  reducers: {
    addShape(state, action) {
      let shape = { ...action.payload }
      state.byId[shape.id] = shape
      state.allIds.push(shape.id)
    },
    setCurrentShape(state, action) {
      state.currentId = action.payload
    },
    updateShape(state, action) {
      const shape = action.payload
      state.byId[shape.id] = {...state.byId[shape.id], ...shape}
    }
  }
})

export const {
  addShape,
  setCurrentShape,
  updateShape
} = shapesSlice.actions

export default shapesSlice.reducer
