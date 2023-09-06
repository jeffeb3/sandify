import { configureStore } from "@reduxjs/toolkit"
import { loadState, saveState } from "@/common/localStorage"
import { resetLogCounts } from "@/common/debugging"
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

const persistedState =
  typeof jest === "undefined" && usePersistedState
    ? loadState(persistInitKey) || undefined
    : undefined

// reset some values
if (persistedState) {
  persistedState.fonts.loaded = false
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
