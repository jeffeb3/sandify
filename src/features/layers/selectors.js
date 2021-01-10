import { createSelectorCreator, defaultMemoize, createSelector } from 'reselect'
import isEqual from 'lodash'

// does a deep equality check instead of checking immutability; used in cases
// where a selector depends on another selector that returns a new object each time,
// e.g., makeGetLayerIndex
const createDeepEqualSelector = createSelectorCreator(defaultMemoize, isEqual)

// root selectors
const getCurrentLayerId = state => { return state.layers.current }
export const getLayersById = state => { return state.layers.byId }
export const getLayerIds = state => { return state.layers.allIds }

// "deep equal" selectors - do not use these selectors within another selector
// unless you use createDeepEqualSelector, because otherwise the returned
// arrays will be considered to be changed every time, defeating the purpose of
// the selector.
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

export const getVisibleEffectIds = createSelector(
  [ getLayerIds, getLayersById ],
  (layerIds, layers) => {
    return layerIds.filter(id => layers[id].visible && layers[id].effect)
  }
)

// derived selectors
export const getCurrentLayer = createSelector(
  [ getLayersById, getCurrentLayerId ],
  (layers, current) => layers[current]
)

export const getAllLayersInfo = createSelector(
  [ getLayerIds, getLayersById ],
  (layerIds, layersById) => {
    return layerIds.map(id => layersById[id])
  }
)

export const getNumLayers = createSelector(
  getLayerIds,
  (layerIds) => {
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
    return layerIds.filter(id => layers[id].visible && layers[id].dragging).length > 0
  }
)

export const getNumVisibleLayers = createDeepEqualSelector(
  getVisibleLayerIds,
  (layers) => {
    return layers.length
  }
)

// layer selectors
export const makeGetLayer = layerId => {
  return createSelector(
    getLayersById,
    (layers) => {
      return layers[layerId]
    }
  )
}

export const makeGetLayerIndex = layerId => {
  return createDeepEqualSelector(
    getVisibleLayerIds,
    (visibleLayerIds) => {
      return visibleLayerIds.findIndex(id => id === layerId)
    }
  )
}

// returns the next layer id, discounting layer effects
export const makeGetNextLayerId = layerId => {
  return createDeepEqualSelector(
    [ getVisibleNonEffectIds ],
    (visibleLayerIds) => {
      let index = visibleLayerIds.findIndex(id => id === layerId)
      return (index === visibleLayerIds.length - 1) ? null : index + 1
    }
  )
}

// returns any effects tied to a given layer
export const makeGetEffects = layerId => {
  return createSelector(
    [ getLayersById, getLayerIds ],
    (layers, layerIds) => {
      let visibleLayerIds = layerIds.filter(id => layers[id].visible)
      let layer = layers[layerId]
      let index = visibleLayerIds.findIndex(id => id === layerId)

      if (layer.effect || index === visibleLayerIds.length - 1) {
        return null
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
}
