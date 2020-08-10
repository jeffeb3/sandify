import { createSelector } from 'reselect'

const getLayers = state => state.layers
const getCurrentLayerId = state => state.layers.current

export const getCurrentLayer = createSelector(
  [ getCurrentLayerId, getLayers ],
  (id, layers) => layers.byId[id]
)

export const makeGetLayer = layerId => {
  return createSelector(
    getLayers,
    (layers) => {
      return layers.byId[layerId]
    }
  )
}

export const makeGetLayerIndex = layerId => {
  return createSelector(
    getVisibleLayerIds,
    (visibleLayerIds) => {
      return visibleLayerIds.findIndex(id => id === layerId)
    }
  )
}

// puts the current layer last in the list to ensure it can be rotated; else
// the handle will not rotate
export const getKonvaLayerIds = createSelector(
  [ getLayers, getCurrentLayer ],
  (layers, layer) => {
      const kIds = layers.allIds.filter(id => id !== layer.id)
      kIds.push(layer.id)
      return kIds
  }
)

export const getLayerInfo = createSelector(
  getLayers,
  (layers) => {
      return layers.allIds.map(id => layers.byId[id])
  }
)

export const getNumLayers = createSelector(
  getLayers,
  (layers) => {
    return layers.allIds.length
  }
)

export const getVisibleLayerIds = createSelector(
  getLayers,
  (layers) => {
    return layers.allIds.filter(id => layers.byId[id].visible)
  }
)

export const isDragging = createSelector(
  [ getLayers, getVisibleLayerIds ],
  (layers, visibleIds) => {
    return visibleIds.filter(id => layers.byId[id].dragging).length > 0
  }
)

export const getNumVisibleLayers = createSelector(
  getVisibleLayerIds,
  (layers) => {
    return layers.length
  }
)
