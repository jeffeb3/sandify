import { createSlice } from "@reduxjs/toolkit"
import reduceReducers from 'reduce-reducers'
import { registeredShapes } from './registered_shapes.js'

const initialState = Object.assign({
  current_shape: "Polygon",
  starting_size: 10.0,
}, ...registeredShapes.map((shape) => shape.initialState()))

const shapeSlice = createSlice({
  name: 'shapes',
  initialState: initialState,
  reducers: {
    setCurrentShape(state, action) {
      state.current_shape = action.payload
    },
    setShapeStartingSize(state, action) {
      state.starting_size = action.payload
    }
  }
})

export const {
  setCurrentShape,
  setShapeStartingSize,
} = shapeSlice.actions

export default reduceReducers(shapeSlice.reducer, ...registeredShapes.map((shape) => shape.reducer));
