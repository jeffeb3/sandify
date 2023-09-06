import { combineReducers } from "redux"
import machineReducer from "@/features/machine/machineSlice"
import exporterReducer from "@/features/export/exporterSlice"
import previewReducer from "@/features/preview/previewSlice"
import fontsReducer from "@/features/fonts/fontsSlice"
import layersReducer from "@/features/layers/layersSlice"
import effectsReducer from "@/features/effects/effectsSlice"
import fileReducer from "@/features/file/fileSlice"
import appReducer from "./appSlice"

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

const resetPattern = (state, action) => {
  const newState = JSON.parse(JSON.stringify(state)) // deep copy

  newState.layers = undefined
  newState.effects = undefined
  newState.preview.zoom = 1.0
  newState.preview.sliderValue = 0.0

  return combinedReducer(newState, action)
}

const loadPattern = (state, action) => {
  const { effects, layers } = action.payload
  const newState = JSON.parse(JSON.stringify(state)) // deep copy

  newState.layers = layers
  newState.effects = effects

  const id = newState.layers.ids[0]
  newState.layers.current = id
  newState.layers.selected = id
  newState.preview.sliderValue = 1.0
  newState.preview.zoom = 1.0

  return combinedReducer(newState, action)
}

const rootReducer = (state, action) => {
  if (action.type === "RESET_PATTERN") {
    return resetPattern(state, action)
  } else if (action.type === "LOAD_PATTERN") {
    return loadPattern(state, action)
  }

  return combinedReducer(state, action)
}

export default rootReducer
