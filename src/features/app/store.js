import { configureStore } from "@reduxjs/toolkit"
import { loadState, saveState } from "@/common/localStorage"
import { resetLogCounts } from "@/common/debugging"
import SandifyImporter from "@/features/file/SandifyImporter"
import rootReducer from "./rootSlice"

// by default, state is always persisted in local storage
const usePersistedState = true
const persistState = true

let persistedState =
  typeof jest === "undefined" && usePersistedState
    ? loadState() || undefined
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
      saveState(state)
      resetLogCounts()
    }
  })
}

export default store
