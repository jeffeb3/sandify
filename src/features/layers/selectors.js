import { getLayers, createDeepEqualSelector } from '../store/selectors'
import { createSelector } from 'reselect'
import { memoizeArrayProducingFn } from '../../common/selectors'
import { getVisibleLayerIdsInOrder, getCurrentLayerState, getLayerOrder, getLayersById } from './layersSlice.js' // TODO temporary
import { log } from '../../common/util'

// puts the current layer last in the list to ensure it can be rotated; else
// the handle will not rotate
export const getKonvaLayerIds = createSelector(
  [ getCurrentLayerState, getVisibleLayerIdsInOrder ],
  (currentLayer, visibleLayerIds) => {
      const kIds = visibleLayerIds.filter(id => id !== currentLayer.id)
      if (currentLayer.visible) {
        kIds.push(currentLayer.id)
      }
      return kIds
  }
)

export const isDragging = createSelector(
  [ getLayerOrder, getLayersById ],
  (layerOrder, layers) => {
    log("isDragging")
    return layerOrder.filter(id => layers[id].visible && layers[id].dragging).length > 0
  }
)

export const getNumVisibleLayers = createSelector(
  getVisibleLayerIdsInOrder,
  (layers) => {
    return layers.length
  }
)

export const makeGetLayerIndex = layerId => {
  return createDeepEqualSelector(
    getVisibleLayerIdsInOrder,
    (visibleLayerIds) => {
      return visibleLayerIds.findIndex(id => id === layerId)
    }
  )
}

export const makeGetNonEffectLayerIndex = layerId => {
  return createDeepEqualSelector(
    getVisibleLayerIdsInOrder,
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
      getVisibleLayerIdsInOrder
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
