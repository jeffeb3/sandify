import { createSelectorCreator, defaultMemoize, createSelector } from 'reselect'
import isEqual from 'lodash'

// the make selector functions below are patterned after the comment here:
// https://github.com/reduxjs/reselect/issues/74#issuecomment-472442728
const cachedSelectors = {}

// ensures we only create a single selector for a given layer
export const getCachedSelector = (fn, ...layerIds) => {
  const key = layerIds.join('-')

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
// e.g., makeGetLayerIndex
export const createDeepEqualSelector = createSelectorCreator(defaultMemoize, isEqual)

// root selectors
export const getState = state => state
export const getMain = state => { return state.main }
export const getLayers = createSelector(getMain, (main) => main.layers)
export const getApp = createSelector(getMain, (main) => main.app)
export const getExporter = createSelector(getMain, (main) => main.exporter)
export const getMachine = createSelector(getMain, (main) => main.machine)
export const getPreview = createSelector(getMain, (main) => main.preview)
export const getFonts = state => state.fonts
