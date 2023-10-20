import { combineReducers } from "redux"
import machinesReducer from "@/features/machines/machinesSlice"
import exporterReducer from "@/features/export/exporterSlice"
import previewReducer from "@/features/preview/previewSlice"
import fontsReducer from "@/features/fonts/fontsSlice"
import imagesReducer from "@/features/images/imagesSlice"
import layersReducer from "@/features/layers/layersSlice"
import effectsReducer from "@/features/effects/effectsSlice"
import fileReducer from "@/features/file/fileSlice"
import { saveState } from "@/common/localStorage"

const combinedReducer = combineReducers({
  effects: effectsReducer,
  exporter: exporterReducer,
  file: fileReducer,
  fonts: fontsReducer,
  images: imagesReducer,
  layers: layersReducer,
  machines: machinesReducer,
  preview: previewReducer,
})

const resetPattern = (state, action) => {
  const newState = JSON.parse(JSON.stringify(state)) // deep copy

  newState.layers = undefined
  newState.effects = undefined
  newState.images = undefined
  newState.preview.zoom = 1.0
  newState.preview.sliderValue = 0.0

  return combinedReducer(newState, action)
}

const resetAll = (state, action) => {
  saveState({}) // explicitly clear state in local storage
  return combinedReducer(undefined, action)
}

const loadPattern = (state, action) => {
  const { layers, effects, images } = action.payload
  const newState = JSON.parse(JSON.stringify(state)) // deep copy

  newState.layers = layers
  newState.effects = effects
  newState.images = images

  const id = newState.layers.ids[0]
  newState.layers.current = id
  newState.layers.selected = id
  newState.effects.selected = newState.layers.entities[id].effectIds[0]
  newState.preview.sliderValue = 0.0
  newState.preview.zoom = 1.0

  return combinedReducer(newState, action)
}

const rootReducer = (state, action) => {
  if (action.type === "RESET_ALL") {
    return resetAll(state, action)
  } else if (action.type === "RESET_PATTERN") {
    return resetPattern(state, action)
  } else if (action.type === "LOAD_PATTERN") {
    return loadPattern(state, action)
  }

  return combinedReducer(state, action)
}

export default rootReducer
