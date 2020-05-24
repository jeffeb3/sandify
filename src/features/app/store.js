import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit"
import { combineReducers } from 'redux'
import appReducer from './appSlice'
import importerReducer from '../importer/importerSlice'
import machineReducer from '../machine/machineSlice'
import exporterReducer from '../exporter/exporterSlice'
import previewReducer from '../preview/previewSlice'
import { registeredShapes } from '../../models/shapes'
import { loadState, saveState } from '../../common/localStorage'
import layersReducer, { setCurrentLayer, addLayer } from '../layers/layersSlice'

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
    layers: layersReducer,
    importer: importerReducer,
    exporter: exporterReducer,
    machine: machineReducer,
    preview: previewReducer
  }),
  middleware: customizedMiddleware
})

// set to true when running locally if you want to preserve your shape
// settings across page loads; don't forget to toggle false when done testing!
const persistState = true
if (persistState) {
  // override default values with saved ones
  const persistedState = loadState()

  if (persistedState) {
    persistedState.layers.allIds.forEach((id) => {
      let layer = persistedState.layers.byId[id]
      store.dispatch(addLayer(layer))
    })
  }
} else {
  const storedShape = localStorage.getItem('currentShape')
  const currentShape = storedShape && registeredShapes[storedShape] ? storedShape : 'polygon'
  const layer = registeredShapes[currentShape].getInitialState()
  store.dispatch(addLayer(layer))
}

const state = store.getState()
store.dispatch(setCurrentLayer(state.layers.byId[state.layers.allIds[0]].id))

if (persistState) {
  store.subscribe(() => {
    const state = store.getState()

    saveState({
      layers: state.layers,
    })
  })
}

export default store
