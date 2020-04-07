import { configureStore } from "@reduxjs/toolkit"
import { combineReducers } from 'redux'
import appReducer from './appSlice'
import fileReducer from '../theta_rho/fileSlice'
import machineReducer from '../machine/machineSlice'
import gcodeReducer from '../gcode/gCodeSlice'
import shapesReducer from '../shapes/shapesSlice'
import transformsReducer from '../transforms/transformsSlice'
import { registeredShapes } from '../../common/registeredShapes'
import { loadState, saveState } from '../../common/localStorage'
import { addShape, setCurrentShape, updateShape } from '../shapes/shapesSlice'
import { addTransform, updateTransform } from '../transforms/transformsSlice'

const store = configureStore({
  reducer: combineReducers({
    app: appReducer,
    shapes: shapesReducer,
    transforms: transformsReducer,
    file: fileReducer,
    gcode: gcodeReducer,
    machine: machineReducer
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

// set to true when running locally if you want to preserve your shape
// settings across page loads; don't forget to toggle false when done testing!
const persistState = true
if (persistState) {
  // override default values with saved ones
  const persistedState = loadState()

  if (persistedState) {
    Object.keys(persistedState.shapes.byId).forEach((key) => {
      let shape = persistedState.shapes.byId[key]
      shape.id = key
      store.dispatch(updateShape(shape))
    })

    Object.keys(persistedState.transforms.byId).forEach((key) => {
      let transform = persistedState.transforms.byId[key]
      transform.id = key
      store.dispatch(updateTransform(transform))
    })
  }
}

const storedShape = localStorage.getItem('currentShape')
const currentShape = storedShape && registeredShapes[storedShape] ? storedShape : 'polygon'
store.dispatch(setCurrentShape(currentShape))

if (persistState) {
  store.subscribe(() => {
    const state = store.getState()

    saveState({
      shapes: state.shapes,
      transforms: state.transforms
    })
  })
}

export default store
