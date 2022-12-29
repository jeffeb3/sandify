import { createSlice } from '@reduxjs/toolkit'
import { createSelector } from 'reselect'
import uniqueId from 'lodash/uniqueId'
import arrayMove from 'array-move'
import { getLayers, createDeepEqualSelector } from '../store/selectors'
import { getModelFromLayer, getModelFromType } from '../../config/models'
import { getEffectModel } from '../../config/effects'
import Layer from '../../models/Layer'
import { log } from '../../common/util'

const protectedAttrs = [
  'selectGroup', 'canChangeSize', 'autosize', 'usesMachine', 'canChangeHeight',
  'canRotate', 'usesFonts'
]

function createLayer(state, shapeState) {
  const restore = shapeState.restore
  delete shapeState.restore
  const name = shapeState.name
  delete shapeState.name
  const layer = {
    id: (restore && shapeState.id) || uniqueId('layer-'),
    name: name,
    shape: {...shapeState},
    effectIds: [],
    ...(new Layer()).getInitialState(),
  }

  state.layerById[layer.id] = layer
  return layer
}

function deleteLayer(state, deleteId) {
  const idx = state.layerOrder.findIndex(id => id === deleteId)
  state.layerOrder.splice(idx, 1)
  delete state.layerById[deleteId]
  return idx
}

function deleteEffect(state, effectId, layerId) {
  const layer = state.layerById[layerId]
  const idx = layer.effectIds.findIndex(id => id === effectId)
  layer.effectIds.splice(idx, 1)

  delete state.effectsById[effectId]
  return idx
}

function createEffect(state, layer, attrs) {
  const restore = attrs.restore
  delete attrs.restore
  const effect = {
    ...attrs,
    id: (restore && attrs.id) || uniqueId('effect-'),
  }

  state.effectsById[effect.id] = effect

  layer.effectIds ||= []
  layer.effectIds.push(effect.id)
  layer.effectIds = [...new Set(layer.effectIds)]

  return effect
}

function nextLayerIndex(state) {
  if (state.currentLayerId) {
    return state.layerOrder.findIndex(id => id === state.currentLayerId) + 1
  } else {
    return 0
  }
}

// TODO: remove this function when you refactor to remove 'selected' feature; currently disabled
function setCurrentId(state, id) {
  if (state.layerById[id].effectIds.length === 0) {
    // We don't have any effects on this layer
    setCurrentEffectId(state, undefined)
  } else if (state.currentLayerId !== id) {
    setCurrentEffectId(state, state.layerById[id].effectIds[0])
  }

  state.selected = id
  state.currentLayerId = id
}

function setCurrentEffectId(state, id) {
  state.currentEffectId = id
}

const layersSlice = createSlice({
  name: 'layer', // TODO layers, with an s. This is all the layers
  initialState: {
    currentLayerId: null,
    currentEffectId: null,
    layerOrder: [],
    layerById: {},
    effectsById: {},
    // TODO remove
    selected: null,
    copyLayerName: null,
  },
  reducers: {
    // The shape initial state is always in action.payload
    addLayer(state, action) {
      const index = nextLayerIndex(state)
      const layer = createLayer(state, action.payload)

      state.layerOrder.splice(index, 0, layer.id)
      setCurrentId(state, layer.id)
      state.newLayerName = layer.name

      if (layer.type !== 'file_import') {
        localStorage.setItem(layer.effect ? 'currentEffect' : 'currentShape', layer.type)
      }
    },
    moveLayer(state, action) {
      const { oldIndex, newIndex } = action.payload
      state.layerOrder = arrayMove(state.layerOrder, oldIndex, newIndex)
    },
    copyLayer(state, action) {
      const source = state.layerById[action.payload]
      const layer = createLayer(state, {
        ...source.shape,
        name: state.copyLayerName
      })
      delete layer.effectIds

      if (source.effectIds) {
        layer.effectIds = source.effectIds.map(effectId => {
          return createEffect(state, layer, state.effectsById[effectId]).id
        })
      }

      const index = state.layerOrder.findIndex(id => id === state.currentLayerId) + 1
      state.layerOrder.splice(index, 0, layer.id)
      setCurrentId(state, layer.id)
    },
    removeLayer(state, action) {
      const id = action.payload
      const layer = state.layerById[id]

      if (layer.effectIds) {
        // Remove effects so they don't become zombies
        const effectsIdsToRemove = layer.effectIds.map(effectId => effectId)
        effectsIdsToRemove.forEach(effectId => {
          deleteEffect(state, effectId, id)
        })
      }

      const idx = deleteLayer(state, id)
      if (id === state.currentLayerId) {
        if (idx === state.layerOrder.length) {
          setCurrentId(state, state.layerOrder[idx-1])
        } else {
          setCurrentId(state, state.layerOrder[idx])
        }
      }

    },
    restoreDefaults(state, action) {
      const id = action.payload
      const layer = state.layerById[id]
      const shapeModel = getModelFromLayer(layer)
      const shapeDefaults = shapeModel.getInitialState()

      state.layerById[layer.id] = {
        id: layer.id,
        name: layer.name,
        shape: shapeDefaults,
        effectIds: layer.effectIds.slice(),
        ...(new Layer()).getInitialState(),
      }
    },
    setCurrentLayer(state, action) {
      const current = state.layerById[action.payload]

      if (current) {
        setCurrentId(state, current.id)
        state.copyLayerName = current.name
      }
    },
    setSelectedLayer(state, action) {
      state.selected = action.payload
    },
    setShapeType(state, action) {
      const changes = action.payload
      const defaults = getModelFromType(changes.type).getInitialState()
      const layer = state.layerById[changes.id]

      layer.shape =  {
          ...defaults
      }
    },
    addEffect(state, action) {
      const layer = state.layerById[action.payload.parentId]
      if (layer === undefined) return

      const effect = createEffect(state, layer, action.payload)
      setCurrentEffectId(state, effect.id)
    },
    removeEffect(state, action) {
      const idx = deleteEffect(state, action.payload.effectId, action.payload.layerId)
      const layer = state.layerById[action.payload.layerId]

      // set the next id
      if (idx >= layer.effectIds.length) {
        if (layer.effectIds.length === 0) {
          log("no more effects, setting to undefined")
          setCurrentEffectId(state, undefined)
        } else {
          if (idx === layer.effectIds.length) {
            log("removed end, setting to ", idx-1)
            setCurrentEffectId(state, layer.effectIds[idx-1])
          }
        }
      } else {
        log("removed middle, setting to ", idx)
        setCurrentEffectId(state, layer.effectIds[idx])
      }
    },
    moveEffect(state, action) {
      const { oldIndex, newIndex } = action.payload
      state.layerById[state.currentLayerId].effectIds = arrayMove(state.layerById[state.currentLayerId].effectIds, oldIndex, newIndex)
    },
    setCurrentEffect(state, action) {
      const current = state.effectsById[action.payload]

      if (current) {
        setCurrentEffectId(state, current.id)
      }
    },
    updateLayer(state, action) {
      const layer = action.payload
      const currLayer = state.layerById[layer.id]
      state.layerById[layer.id] = {...currLayer, ...layer}
    },
    updateShape(state, action) {
      const shape = action.payload
      const currShape = state.layerById[shape.id].shape
      state.layerById[shape.id].shape = {...currShape, ...shape}
    },
    updateEffect(state, action) {
      const effect = action.payload
      const currEffect = state.effectsById[effect.id]
      state.effectsById[effect.id] = {...currEffect, ...effect}
    },
    updateLayers(state, action) {
      Object.assign(state, action.payload)
    },
    toggleVisible(state, action) {
      const layer = action.payload
      state.layerById[layer.id].visible = !state.layerById[layer.id].visible
    },
  }
})

///////////////////////
/// Selectors
///////////////////////

// Main layers
export const getLayersById = createSelector(
  getLayers,
  (layers) => layers.layerById
)

export const getLayerOrder = createSelector(
  getLayers,
  (layers) => layers.layerOrder
)

export const getAllLayersStates = createSelector(
  [ getLayerOrder, getLayersById ],
  (layerOrder, layersById) => {
    log("getAllLayersInfo")
    return layerOrder.map(id => layersById[id])
  }
)

export const getNumLayers = createSelector(
  getLayerOrder,
  (layerOrder) => {
    log("getNumLayer")
    return layerOrder.length
  }
)

export const getCurrentLayerId = createSelector(
  getLayers,
  (layers) => layers.currentLayerId
)

// TODO move to layerSlice?
export const getCurrentLayerState = createSelector(
  [ getLayersById, getCurrentLayerId ],
  (layers, current) => {
    return layers[current]
  }
)

export const getVisibleLayerIdsInOrder = createSelector(
  [ getLayerOrder, getLayersById ],
  (layerOrder, layers) => {
    return layerOrder.filter(id => layers[id].visible)
  }
)

export const makeGetShapeAttrs = layerId => {
  return createSelector(
    getLayersById,
    (layers) => {
      return getModelFromLayer(layers[layerId]).getAttrs()
    }
  )
}

// Effects
const getEffectsById = createSelector(
  getLayers,
  (layers) => layers.effectsById
)

export const getCurrentEffectId = createSelector(
  getLayers,
  (layers) => layers.currentEffectId
)

// TODO move to effectSlice?
export const getCurrentEffectState = createSelector(
  [getEffectsById, getCurrentEffectId],
  (effectsById, effectId) => {
    if (effectId) {
      return effectsById[effectId]
    } else {
      return undefined
    }
  }
)

export const makeGetLayerEffectStatesInOrder = layerId => {
  return createSelector(
    [getLayersById, getEffectsById],
    (layers, effectsById) => {
      return layers[layerId].effectIds.map(id => effectsById[id])
    }
  )
}

// TODO move to layerSlice?
export const getCurrentLayerEffectIdsInOrder = createSelector(
  [ getCurrentLayerState ],
  ( layer ) => {
    return layer.effectIds
  }
)

// TODO move to layerSlice?
export const getCurrentLayerNumEffects = createSelector(
  getCurrentLayerEffectIdsInOrder,
  (effects) => {
    log("getNumEffects")
    return effects.length
  }
)

// TODO move to effectSlice? layerSlice?
export const getCurrentEffectsStates = createSelector(
  [ getCurrentLayerEffectIdsInOrder, getEffectsById ],
  (effectIds, layersById) => {
    log("getCurrentEffectsStates")
    return effectIds.map(id => layersById[id])
  }
)

///////////////////////
/// Exports
///////////////////////

export const {
  addLayer,
  copyLayer,
  moveLayer,
  removeLayer,
  addEffect,
  removeEffect,
  moveEffect,
  restoreDefaults,
  setCurrentLayer,
  setCurrentEffect,
  setSelectedLayer,
  setShapeType,
  updateLayer,
  updateShape,
  updateEffect,
  updateLayers,
  toggleVisible,
} = layersSlice.actions

export default layersSlice.reducer
