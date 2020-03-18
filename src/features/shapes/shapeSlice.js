import { createSlice } from "@reduxjs/toolkit"
import reduceReducers from 'reduce-reducers'
import { registeredShapes } from './registered_shapes.js'

const initialState = Object.assign({
  current_shape: "Polygon",
}, ...registeredShapes.map((shape) => shape.initialState()))

const shapeSlice = createSlice({
  name: 'shapes',
  initialState: initialState,
  reducers: {
    setCurrentShape(state, action) {
      state.current_shape = action.payload
    },
  }
})

export const {
  setCurrentShape,
} = shapeSlice.actions

export default reduceReducers(shapeSlice.reducer, ...registeredShapes.map((shape) => shape.reducer));
