import {
  getLayersState,
  createDeepEqualSelector,
} from "@/features/store/selectors"
import { createSelector } from "reselect"
import { createCachedSelector } from "re-reselect"
import { memoizeArrayProducingFn } from "@/common/selectors"
import { log } from "@/common/debugging"

const getCurrentLayerId = createSelector(
  getLayersState,
  (layers) => layers.current,
)

const getLayersById = createSelector(getLayersState, (layers) => {
  return layers.byId
})

const getOrderedLayerIds = createSelector(
  getLayersState,
  (layers) => layers.allIds,
)

export const getVisibleOrderedLayerIds = createSelector(
  [getOrderedLayerIds, getLayersById],
  (layerIds, layers) => {
    return layerIds.filter((id) => layers[id].visible)
  },
)

export const getVisibleNonEffectIds = createSelector(
  [getVisibleOrderedLayerIds, getLayersById],
  (layerIds, layers) => {
    return layerIds.filter((id) => !layers[id].effect)
  },
)

export const getCurrentLayer = createSelector(
  [getLayersById, getCurrentLayerId],
  (layers, current) => {
    return layers[current]
  },
)

export const getAllLayers = createSelector(
  [getOrderedLayerIds, getLayersById],
  (layerIds, layersById) => {
    log("getAllLayers")
    return layerIds.map((id) => layersById[id])
  },
)

export const getNumLayers = createSelector(getOrderedLayerIds, (layerIds) => {
  log("getNumLayer")
  return layerIds.length
})

// puts the current layer last in the list to ensure it can be rotated; else
// the handle will not rotate
export const getKonvaLayerIds = createSelector(
  [getCurrentLayer, getVisibleOrderedLayerIds],
  (currentLayer, visibleLayerIds) => {
    const kIds = visibleLayerIds.filter((id) => id !== currentLayer.id)
    if (currentLayer.visible) {
      kIds.push(currentLayer.id)
    }
    return kIds
  },
)

export const isDragging = createSelector(
  [getOrderedLayerIds, getLayersById],
  (layerIds, layers) => {
    log("isDragging")
    return (
      layerIds.filter((id) => layers[id].visible && layers[id].dragging)
        .length > 0
    )
  },
)

export const getNumVisibleLayers = createSelector(
  getVisibleNonEffectIds,
  (layers) => {
    return layers.length
  },
)

export const getLayerIndex = createCachedSelector(
  (state, id) => id,
  getVisibleOrderedLayerIds,
  (layerId, visibleLayerIds) => {
    return visibleLayerIds.findIndex((id) => id === layerId)
  },
)({
  selectorCreator: createDeepEqualSelector,
  keySelector: (state, id) => id,
})

export const getNonEffectLayerIndex = createCachedSelector(
  getVisibleNonEffectIds,
  (state, id) => id,
  (visibleLayerIds, layerId) => {
    return visibleLayerIds.findIndex((id) => id === layerId)
  },
)((state, id) => id)

export const getLayer = createCachedSelector(
  getLayersState,
  (state, id) => id,
  (layers, id) => layers.byId[id],
)((state, id) => id)

// returns any effects tied to a given layer; memoizeArrayProducingFn will ensure we
// only recompute transformed vertices when an effect changes.
export const getLayerEffects = createCachedSelector(
  (state, id) => id,
  getLayersById,
  getVisibleOrderedLayerIds,
  memoizeArrayProducingFn((layerId, layers, visibleLayerIds) => {
    let index = visibleLayerIds.findIndex((id) => id === layerId)
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
  }),
)((state, id) => id)
