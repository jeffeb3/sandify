import { configureStore } from "@reduxjs/toolkit"
import { loadState, saveState } from "@/common/localStorage"
import { resetLogCounts } from "@/common/debugging"
import SandifyImporter from "@/features/file/SandifyImporter"
import rootReducer from "./rootSlice"

// by default, state is always persisted in local storage
const usePersistedState = true
const persistState = true

// if you want to save a multiple temporary states, use these keys. The first time
// you save a new state, change persistSaveKey. Make a change, then change
// persistInitKey to the same value. persistSaveKey is mostly obsolete now
// given that a user can save their pattern to a file.
const persistInitKey = "state"
const persistSaveKey = "state"

let persistedState =
  typeof jest === "undefined" && usePersistedState
    ? loadState(persistInitKey) || undefined
    : undefined

// reset some values
if (persistedState) {
  const importer = new SandifyImporter()
  try {
    // double JSON parsing ensures it's valid JSON before we try to import it
    importer.import(JSON.stringify(persistedState))
    persistedState.fonts.loaded = false
  } catch (err) {
    persistedState = undefined
  }
}

const store = configureStore({
  reducer: rootReducer,
  preloadedState: persistedState,
})

if (persistState) {
  store.subscribe(() => {
    const state = store.getState()
    if (state.fonts.loaded) {
      saveState(state, persistSaveKey)
      resetLogCounts()
    }
  })
}

export default store
