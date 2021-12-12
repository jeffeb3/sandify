import { configureStore } from "@reduxjs/toolkit"
import { combineReducers } from 'redux'
import appReducer from './appSlice'
import machineReducer from '../machine/machineSlice'
import exporterReducer from '../exporter/exporterSlice'
import previewReducer from '../preview/previewSlice'
import fontsReducer from '../fonts/fontsSlice'
import { registeredShapes } from '../../models/shapes'
import { loadState, saveState } from '../../common/localStorage'
import layersReducer, { setCurrentLayer, addLayer } from '../layers/layersSlice'

//const customizedMiddleware = getDefaultMiddleware({
//  immutableCheck: {
//    ignoredPaths: ['importer.vertices']
//  },
//  serializableCheck: {
//    ignoredPaths: ['importer.vertices']
//  }
//})

const store = configureStore({
  reducer: combineReducers({
    app: appReducer,
    layers: layersReducer,
    exporter: exporterReducer,
    machine: machineReducer,
    preview: previewReducer,
    fonts: fontsReducer
  })
})

// set to true when running locally if you want to preserve your shape
// settings across page loads; don't forget to toggle false when done testing!
const persistState = false

// if you want to save a multiple temporary states, use these keys. The first time
// you save a new state, change persistSaveKey. Make a change, then change
// persistInitKey to the same value. It's like doing a "save as"
const persistInitKey = 'state'
const persistSaveKey = 'state'
// const persistInitKey = 'bubble-rings'
// const persistSaveKey = 'bubble-rings'

// never persist state when running within a jest spec
if (process.env.JEST_WORKER_ID === undefined && persistState) {
  // override default values with saved ones
  const persistedState = loadState(persistInitKey)

  if (persistedState) {
    persistedState.layers.allIds.forEach((id) => {
      let layer = persistedState.layers.byId[id]

      if (layer.startingWidth === undefined) layer.startingWidth = layer.startingSize
      if (layer.startingHeight === undefined) layer.startingHeight = layer.startingWidth
      if (layer.autosize === undefined) layer.autosize = true

      store.dispatch(addLayer(layer))
    })
    store.dispatch(setCurrentLayer(persistedState.layers.current))
  }
} else {
  const storedShape = localStorage.getItem('currentShape')
  const currentShape = storedShape && registeredShapes[storedShape] ? storedShape : 'polygon'
  const layer = registeredShapes[currentShape].getInitialState()

  store.dispatch(addLayer(layer))

  const state = store.getState()
  store.dispatch(setCurrentLayer(state.layers.byId[state.layers.allIds[0]].id))
}

if (persistState) {
  store.subscribe(() => {
    const state = store.getState()

    saveState({ layers: state.layers }, persistSaveKey)
  })
}

export default store
