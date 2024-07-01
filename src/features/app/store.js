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

// support a URL-based reset as a last resort
const params = new URLSearchParams(window.location.search)
const reset = params.get("reset")

// reset some values
if (reset === "all") {
  persistedState = undefined
} else {
  if (persistedState) {
    const importer = new SandifyImporter()
    try {
      // double JSON parsing ensures it's valid JSON before we try to import it
      persistedState = importer.import(JSON.stringify(persistedState))
      persistedState.fonts.loaded = false
      persistedState.images.loaded = false
    } catch (err) {
      persistedState = undefined
    }
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

      if (reset) {
        window.location.href = window.location.pathname
      }
    }
  })
}

export default store
