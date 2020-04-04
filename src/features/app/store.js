import { configureStore } from "@reduxjs/toolkit"
import { combineReducers } from 'redux'
import appReducer from './appSlice'
import fileReducer from '../theta_rho/fileSlice'
import machineReducer from '../machine/machineSlice'
import gcodeReducer from '../gcode/gCodeSlice'
import shapesReducer from '../shapes/shapesSlice'
import transformsReducer from '../transforms/transformsSlice'
import turtleReducer from '../turtle/turtleSlice'
import { registeredShapes } from '../../common/registeredShapes'
import {
  addShape,
  setCurrentShape
} from '../shapes/shapesSlice'
import { addTransform } from '../transforms/transformsSlice'

const store = configureStore({
  reducer: combineReducers({
    app: appReducer,
    shapes: shapesReducer,
    transforms: transformsReducer,
    file: fileReducer,
    gcode: gcodeReducer,
    machine: machineReducer,
    turtle: turtleReducer
  }),
})

// preload shapes into store
Object.keys(registeredShapes).forEach(key => {
  let shape = registeredShapes[key]
  let state = shape.getInitialState()

  state.id = key
  state.name = shape.name
  store.dispatch(addTransform({id: state.id, repeatEnabled: state.repeatEnabled}))
  store.dispatch(addShape(state))
})

const storedShape = localStorage.getItem('currentShape')
const currentShape = storedShape && registeredShapes[storedShape] ? storedShape : 'polygon'
store.dispatch(setCurrentShape(currentShape))

export default store
