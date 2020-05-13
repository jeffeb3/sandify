import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit"
import { combineReducers } from 'redux'
import appReducer from './appSlice'
import importerReducer from '../importer/importerSlice'
import machineReducer from '../machine/machineSlice'
import exporterReducer from '../exporter/exporterSlice'
import previewReducer from '../preview/previewSlice'
import shapesReducer from '../shapes/shapesSlice'
import { registeredShapes } from '../../common/registeredShapes'
import { loadState, saveState } from '../../common/localStorage'
import { addShape, setCurrentShape, updateShape } from '../shapes/shapesSlice'

const customizedMiddleware = getDefaultMiddleware({
  immutableCheck: {
    ignoredPaths: ['importer.vertices']
  },
  serializableCheck: {
    ignoredPaths: ['importer.vertices']
  }
})

const store = configureStore({
  reducer: combineReducers({
    app: appReducer,
    shapes: shapesReducer,
    importer: importerReducer,
    exporter: exporterReducer,
    machine: machineReducer,
    preview: previewReducer
  }),
  middleware: customizedMiddleware
})

// preload shapes into store
Object.keys(registeredShapes).forEach(key => {
  const shape = registeredShapes[key]
  const state = shape.getInitialState()

  state.id = key
  state.name = shape.name
  store.dispatch(addShape(state))
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
    })
  })
}

export default store
