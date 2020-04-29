import { configureStore } from "@reduxjs/toolkit"
import { combineReducers } from 'redux'
import appReducer from './appSlice'
import importerReducer from '../importer/importerSlice'
import machineReducer from '../machine/machineSlice'
import exporterReducer from '../exporter/exporterSlice'
import previewReducer from '../preview/previewSlice'
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
    importer: importerReducer,
    exporter: exporterReducer,
    machine: machineReducer,
    preview: previewReducer
  }),
})

// preload shapes into store
Object.keys(registeredShapes).forEach(key => {
  const shape = registeredShapes[key]
  const state = shape.getInitialState()
  const tState = shape.getInitialTransformState()

  state.id = key
  state.name = shape.name

  store.dispatch(addShape(state))
  store.dispatch(addTransform({
    ...{id: state.id },
    ...tState,
  }))
})

// set to true when running locally if you want to preserve your shape
// settings across page loads; don't forget to toggle false when done testing!
const persistState = false
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
