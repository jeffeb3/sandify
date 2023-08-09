import { configureStore } from "@reduxjs/toolkit"
import { combineReducers } from "redux"
import machineReducer from "@/features/machine/machineSlice"
import exporterReducer from "@/features/exporter/exporterSlice"
import previewReducer from "@/features/preview/previewSlice"
import fontsReducer from "@/features/fonts/fontsSlice"
import layersReducer from "@/features/layers/layersSlice"
import effectsReducer from "@/features/effects/effectsSlice"
import { loadState, saveState } from "@/common/localStorage"
import { resetLogCounts } from "@/common/debugging"
import appReducer from "./appSlice"

/*
const customizedMiddleware = getDefaultMiddleware({
  immutableCheck: {
    ignoredPaths: ['importer.vertices']
  },
  serializableCheck: {
    ignoredPaths: ['importer.vertices']
  }
})
*/

// set both to true when running locally if you want to preserve your shape
// settings across page loads; don't forget to toggle false when done testing!
const usePersistedState = true
const persistState = true

// if you want to save a multiple temporary states, use these keys. The first time
// you save a new state, change persistSaveKey. Make a change, then change
// persistInitKey to the same value. It's like doing a "save as"
const persistInitKey = "state"
const persistSaveKey = "state"

const persistedState =
  typeof jest === "undefined" && usePersistedState
    ? loadState(persistInitKey) || undefined
    : undefined

// reset some values
if (persistedState) {
  persistedState.fonts.loaded = false
  // persistedState.effects.current = null
}

const store = configureStore({
  reducer: combineReducers({
    app: appReducer,
    layers: layersReducer,
    effects: effectsReducer,
    exporter: exporterReducer,
    machine: machineReducer,
    preview: previewReducer,
    fonts: fontsReducer,
  }),
  preloadedState: persistedState,
})

if (persistState) {
  store.subscribe(() => {
    saveState(store.getState(), persistSaveKey)
    resetLogCounts()
  })
}

export default store
