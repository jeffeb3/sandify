import { createSelectorCreator, defaultMemoize, createSelector } from "reselect"
import isEqual from "lodash"

// the make selector functions below are patterned after the comment here:
// https://github.com/reduxjs/reselect/issues/74#issuecomment-472442728
const cachedSelectors = {}

// ensures we only create a single selector for a given layer
export const getCachedSelector = (fn, ...layerIds) => {
  const key = layerIds.join("-")

  if (!cachedSelectors[fn.name]) {
    cachedSelectors[fn.name] = {}
  }

  if (!cachedSelectors[fn.name][key]) {
    cachedSelectors[fn.name][key] = fn.apply(null, layerIds)
  }

  return cachedSelectors[fn.name][key]
}

// does a deep equality check instead of checking immutability; used in cases
// where a selector depends on another selector that returns a new object each time,
// e.g., getLayerIndex
export const createDeepEqualSelector = createSelectorCreator(
  defaultMemoize,
  isEqual,
)

// root state selectors
export const getState = (state) => state
export const getMainState = (state) => state.main
export const getLayersState = createSelector(
  getMainState,
  (main) => main.layers,
)
export const getAppState = createSelector(getMainState, (main) => main.app)
export const getExporterState = createSelector(
  getMainState,
  (main) => main.exporter,
)
export const getMachineState = createSelector(
  getMainState,
  (main) => main.machine,
)
export const getPreviewState = createSelector(
  getMainState,
  (main) => main.preview,
)
export const getFontsState = (state) => state.fonts
