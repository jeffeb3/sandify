import { createSlice } from "@reduxjs/toolkit"
import reduceReducers from 'reduce-reducers';
import { Polygon } from './Polygon.js';
import { Star } from './Star.js';
import { Circle } from './Circle.js';
import { Heart } from './Heart.js';
import { Reuleaux } from './Reuleaux.js';
import { Epicycloid } from './Epicycloid.js';
import { Hypocycloid } from './Hypocycloid.js';
import { Rose } from './Rose.js';
import { InputText } from './InputText.js';
import { V1Engineering } from './V1Engineering.js';

export const registeredShapes = [Polygon, Star, Circle, Heart, Reuleaux, Epicycloid,
  Hypocycloid, Rose, InputText, V1Engineering];

const shapesSlice = createSlice({
  name: 'shapes',
  initialState: {
    shapes: [],
    current_shape: "Polygon",
    polygon_sides: 4,
    star_points: 5,
    star_ratio: 0.5,
    circle_lobes: 1,
    reuleaux_sides: 3,
    input_text: "Sandify",
    starting_size: 10.0,
    epicycloid_a: 1.0,
    epicycloid_b: .25,
    hypocycloid_a: 1.0,
    hypocycloid_b: .25,
    rose_n: 3,
    rose_d: 2
  },
  reducers: {
    addShape(state, action) {
      state.shapes.push(action.payload)
    },
    setCurrentShape(state, action) {
      state.current_shape = action.payload
    },
    setShapeStartingSize(state, action) {
      state.starting_size = action.payload
    }
  }
})

export const {
  addShape,
  setCurrentShape,
  setShapeStartingSize,
} = shapesSlice.actions

export default reduceReducers(shapesSlice.reducer, ...registeredShapes.map((shape) => shape.getReducer));
