import { configureStore } from "@reduxjs/toolkit"
import { combineReducers } from 'redux'
import uniqueId from 'lodash/uniqueId'

import appReducer from './appSlice'
import machineReducer from '../machine/machineSlice'
import exporterReducer from '../exporter/exporterSlice'
import previewReducer from '../preview/previewSlice'
import fontsReducer from '../fonts/fontsSlice'
import { registeredShapes } from '../../models/shapes'
import { loadState, saveState } from '../../common/localStorage'
import layersReducer, { setCurrentLayer, addLayer, addEffect, updateLayer } from '../layers/layersSlice'

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
    main: combineReducers({
      app: appReducer,
      layers: layersReducer,
      exporter: exporterReducer,
      machine: machineReducer,
      preview: previewReducer
    }),
    fonts: fontsReducer
  })
})

const loadPersistedLayers = (layers) => {
  layers.allIds.forEach(id => {
    const layer = layers.byId[id]

    if (layer) {
      const newLayer = {
        ...layer,
        id: uniqueId('layer-'),
        restore: true,
        startingWidth: layer.startingWidth || layer.startingSize,
        startingHeight: layer.startingWidth || layer.startingSize,
        autosize: layer.autosize === null ? true : layer.autosize
      }

      // for referential integrity, we have to explicitly generate ids and
      // re-build relationships.
      store.dispatch(addLayer(newLayer))
      if (layer.effectIds) {
        newLayer.effectIds = layer.effectIds.map(effectId => {
          const effect = {
            ...layers.byId[effectId],
            id: uniqueId('layer-'),
            restore: true,
            parentId: newLayer.id
          }
          store.dispatch(addEffect(effect))
          return effect.id
        })
        store.dispatch(updateLayer(newLayer))
      }
    }
  })
}

const loadDefaultLayer = () => {
  const storedShape = localStorage.getItem('currentShape')
  const currentShape = storedShape && registeredShapes[storedShape] ? storedShape : 'polygon'
  const layer = registeredShapes[currentShape].getInitialState()

  store.dispatch(addLayer(layer))

  const state = store.getState()
  store.dispatch(setCurrentLayer(state.main.layers.byId[state.main.layers.allIds[0]].id))
}

// set both to true when running locally if you want to preserve your shape
// settings across page loads; don't forget to toggle false when done testing!
const usePersistedState = true
const persistState = true

// if you want to save a multiple temporary states, use these keys. The first time
// you save a new state, change persistSaveKey. Make a change, then change
// persistInitKey to the same value. It's like doing a "save as"
const persistInitKey = 'state'
const persistSaveKey = 'state'

if (typeof jest === 'undefined' && persistState) {
  // override default values with saved ones
  const persistedState = loadState(persistInitKey)

  if (persistedState) {
    if (persistedState.main && persistedState.main.layers) {
      loadPersistedLayers(persistedState.main.layers)
      store.dispatch(setCurrentLayer(persistedState.main.layers.current))
    } else if (persistedState.layers) {
      loadPersistedLayers(persistedState.layers) // older store format
      store.dispatch(setCurrentLayer(persistedState.layers.current))
    }
  } else {
    loadDefaultLayer()
  }
} else {
  loadDefaultLayer()
}

if (persistState) {
  store.subscribe(() => {
    const state = store.getState()
    saveState({ main: { layers: state.main.layers } }, persistSaveKey)
  })
}

export default store
