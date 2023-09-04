import { configureStore } from "@reduxjs/toolkit"
import { combineReducers } from "redux"
import machineReducer from "@/features/machine/machineSlice"
import exporterReducer from "@/features/export/exporterSlice"
import previewReducer from "@/features/preview/previewSlice"
import fontsReducer from "@/features/fonts/fontsSlice"
import layersReducer from "@/features/layers/layersSlice"
import effectsReducer from "@/features/effects/effectsSlice"
import fileReducer from "@/features/file/fileSlice"
import { loadState, saveState } from "@/common/localStorage"
import { resetLogCounts } from "@/common/debugging"
import appReducer from "./appSlice"

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
}

const combinedReducer = combineReducers({
  app: appReducer,
  effects: effectsReducer,
  exporter: exporterReducer,
  file: fileReducer,
  fonts: fontsReducer,
  layers: layersReducer,
  machine: machineReducer,
  preview: previewReducer,
})

const rootReducer = (state, action) => {
  if (action.type === "NEW_PATTERN") {
    const newState = {
      ...state,
      layers: undefined,
      effects: undefined,
    }
    return combinedReducer(newState, action)
  } else if (action.type === "LOAD_PATTERN") {
    const { effects, layers } = action.payload
    const newState = {
      ...state,
      layers,
      effects,
    }
    return combinedReducer(newState, action)
  }

  return combinedReducer(state, action)
}

const store = configureStore({
  reducer: rootReducer,
  preloadedState: persistedState,
})

if (persistState) {
  store.subscribe(() => {
    saveState(store.getState(), persistSaveKey)
    resetLogCounts()
  })
}

export default store
