import { createSelectorCreator, defaultMemoize, createSelector } from 'reselect'
import { memoizeArrayProducingFn } from '../../common/selectors'
import isEqual from 'lodash'
import { log } from '../../common/util'

// the make selector functions below are patterned after the comment here:
// https://github.com/reduxjs/reselect/issues/74#issuecomment-472442728
const cachedSelectors = {}

// ensures we only create a single selector for a given layer
export const getCachedSelector = (fn, ...layerIds) => {
  if (!cachedSelectors[fn.name]) {
    cachedSelectors[fn.name] = {}
  }

  const key = layerIds.join('-')
  if (!cachedSelectors[fn.name][key]) {
    cachedSelectors[fn.name][key] = fn.apply(null, layerIds)
  }

  return cachedSelectors[fn.name][key]
}

// does a deep equality check instead of checking immutability; used in cases
// where a selector depends on another selector that returns a new object each time,
// e.g., makeGetLayerIndex
const createDeepEqualSelector = createSelectorCreator(defaultMemoize, isEqual)

// root selectors
const getCurrentLayerId = state => { return state.layers.current }
export const getLayersById = state => { return state.layers.byId }
export const getLayerIds = state => { return state.layers.allIds }

// derived selectors
export const getVisibleLayerIds = createSelector(
  [ getLayerIds, getLayersById ],
  (layerIds, layers) => {
    return layerIds.filter(id => layers[id].visible)
  }
)

 export const getVisibleNonEffectIds = createSelector(
   [ getLayerIds, getLayersById ],
   (layerIds, layers) => {
     return layerIds.filter(id => layers[id].visible && !layers[id].effect)
   }
 )

export const getCurrentLayer = createSelector(
  [ getLayersById, getCurrentLayerId ],
  (layers, current) => layers[current]
)

export const getAllLayersInfo = createSelector(
  [ getLayerIds, getLayersById ],
  (layerIds, layersById) => {
    log("getAllLayersInfo")
    return layerIds.map(id => layersById[id])
  }
)

export const getNumLayers = createSelector(
  getLayerIds,
  (layerIds) => {
    log("getNumLayer")
    return layerIds.length
  }
)

// puts the current layer last in the list to ensure it can be rotated; else
// the handle will not rotate
export const getKonvaLayerIds = createSelector(
  [ getCurrentLayer, getVisibleLayerIds ],
  (currentLayer, visibleLayerIds) => {
      const kIds = visibleLayerIds.filter(id => id !== currentLayer.id)
      if (currentLayer.visible) {
        kIds.push(currentLayer.id)
      }
      return kIds
  }
)

export const isDragging = createSelector(
  [ getLayerIds, getLayersById ],
  (layerIds, layers) => {
    log("isDragging")
    return layerIds.filter(id => layers[id].visible && layers[id].dragging).length > 0
  }
)

export const getNumVisibleLayers = createDeepEqualSelector(
  getVisibleLayerIds,
  (layers) => {
    return layers.length
  }
)

export const makeGetLayerIndex = layerId => {
  return createDeepEqualSelector(
    getVisibleLayerIds,
    (visibleLayerIds) => {
      return visibleLayerIds.findIndex(id => id === layerId)
    }
  )
}

export const makeGetNonEffectLayerIndex = layerId => {
  return createDeepEqualSelector(
    getVisibleNonEffectIds,
    (visibleLayerIds) => {
      return visibleLayerIds.findIndex(id => id === layerId)
    }
  )
}

export const makeGetLayer = layerId => {
  return createSelector(
    getLayersById,
    (layers) => {
      return layers[layerId]
    }
  )
}

// returns any effects tied to a given layer; memoizeArrayProducingFn will ensure we
// only recompute transformed vertices when an effect changes.
export const makeGetEffects = layerId => {
  return createSelector(
    [
      getLayersById,
      getVisibleLayerIds
    ],
    memoizeArrayProducingFn(
      (layers, visibleLayerIds) => {
        let index = visibleLayerIds.findIndex(id => id === layerId)
        const layer = layers[layerId]

        if (layer.effect || index === visibleLayerIds.length - 1) {
          return []
        } else {
          index = index + 1
          const effects = []
          let id = visibleLayerIds[index]

          while (id && layers[id].effect) {
            effects.push(layers[id])
            index = index + 1
            id = visibleLayerIds[index]
          }

          return effects
        }
      }
    )
  )
}
