/* global URLSearchParams, window */

import { configureStore, createListenerMiddleware } from "@reduxjs/toolkit"
import { loadState, saveState } from "@/common/localStorage"
import { resetLogCounts } from "@/common/debugging"
import SandifyImporter from "@/features/file/SandifyImporter"
import rootReducer from "./rootSlice"
import { loadFont } from "@/features/fonts/fontsSlice"
import { updateLayer } from "@/features/layers/layersSlice"

// Handle side effects
const listenerMiddleware = createListenerMiddleware()

// When a font finishes loading, update any FancyText layers using that font
// to trigger dimension recalculation
listenerMiddleware.startListening({
  actionCreator: loadFont.fulfilled,
  effect: (action, listenerApi) => {
    const fontName = action.payload
    const state = listenerApi.getState()
    const layers = state.layers.entities

    Object.values(layers).forEach((layer) => {
      if (layer.type === "fancyText" && layer.fancyFont === fontName) {
        listenerApi.dispatch(updateLayer({ id: layer.id, fancyFont: fontName }))
      }
    })
  },
})

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
      persistedState.fonts = { loadedFonts: {}, loadingFonts: {} }
      persistedState.images.loaded = false
    } catch {
      persistedState = undefined
    }
  }
}

const store = configureStore({
  reducer: rootReducer,
  preloadedState: persistedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware),
})

if (persistState) {
  store.subscribe(() => {
    const state = store.getState()
    // Save state to localStorage (fonts are loaded on-demand now)
    saveState(state)
    resetLogCounts()

    if (reset) {
      window.location.href = window.location.pathname
    }
  })
}

export default store
