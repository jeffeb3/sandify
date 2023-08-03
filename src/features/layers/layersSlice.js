import { createSlice, createEntityAdapter } from "@reduxjs/toolkit"
import { createSelector } from "reselect"
import { createCachedSelector } from "re-reselect"
import { v4 as uuidv4 } from "uuid"
import arrayMove from "array-move"
import {
  memoizeArrayProducingFn,
  createDeepEqualSelector,
} from "@/common/selectors"
import { getDefaultModelType } from "@/config/models"
import Layer from "./Layer"
import { selectState } from "@/features/app/appSlice"
import { effectsSlice, selectEffectById } from "@/features/effects/effectsSlice"
import { log } from "@/common/debugging"

// ------------------------------
// Slice, reducers and atomic actions
// ------------------------------

const layersAdapter = createEntityAdapter()
const defaultLayer = new Layer(getDefaultModelType())
const defaultLayerId = uuidv4()
const layerState = {
  id: defaultLayerId,
  ...defaultLayer.getInitialState(),
}
const notCopiedWhenTypeChanges = ["type", "height", "width"]

function currLayerIndex(state) {
  const currentLayer = state.entities[state.current]
  return state.ids.findIndex((id) => id === currentLayer.id)
}

const layersSlice = createSlice({
  name: "layers",
  initialState: layersAdapter.getInitialState({
    current: defaultLayerId,
    selected: defaultLayerId,
    entities: {
      [defaultLayerId]: layerState,
    },
    ids: [defaultLayerId],
  }),
  reducers: {
    addLayer: {
      reducer(state, action) {
        // we need to insert at a specific index, which is not supported by addOne
        const index = state.current ? currLayerIndex(state) + 1 : 0
        const layer = {
          ...action.payload,
          effectIds: [],
        }
        state.ids.splice(index, 0, layer.id)
        state.entities[layer.id] = layer
        state.current = layer.id
        state.selected = layer.id

        if (layer.type !== "fileImport") {
          localStorage.setItem(
            layer.effect ? "defaultEffect" : "defaultModel",
            layer.type,
          )
        }
      },
      prepare(layer) {
        const id = uuidv4()
        // return newly generated id so downstream actions can use it
        return { payload: { ...layer, id }, meta: { id } }
      },
    },
    deleteLayer: (state, action) => {
      const deleteId = action.payload
      const deleteIdx = state.ids.findIndex((id) => id === deleteId)
      layersAdapter.removeOne(state, deleteId)

      if (deleteId === state.current) {
        const idx = deleteIdx === state.ids.length ? deleteIdx - 1 : deleteIdx
        state.current = state.ids[idx]
      }
    },
    moveLayer: (state, action) => {
      const { oldIndex, newIndex } = action.payload
      state.ids = arrayMove(state.ids, oldIndex, newIndex)
    },
    updateLayer: (state, action) => {
      const layer = action.payload
      layersAdapter.updateOne(state, { id: layer.id, changes: layer })
    },
    addEffect: (state, action) => {
      const { id, effectId } = action.payload
      state.entities[id].effectIds.push(effectId)
    },
    moveEffect: (state, action) => {
      const { id, oldIndex, newIndex } = action.payload
      const layer = state.entities[id]

      layer.effectIds = arrayMove(layer.effectIds, oldIndex, newIndex)
    },
    removeEffect: (state, action) => {
      const { id, effectId } = action.payload
      const layer = state.entities[id]
      const idx = layer.effectIds.findIndex((id) => id === effectId)

      layer.effectIds.splice(idx, 1)
    },
    changeModelType: (state, action) => {
      const { type, id } = action.payload
      const layer = state.entities[id]
      const newLayer = new Layer(type).getInitialState()

      Object.keys(newLayer).forEach((attr) => {
        if (
          !notCopiedWhenTypeChanges.includes(attr) &&
          layer[attr] != undefined
        ) {
          newLayer[attr] = layer[attr]
        }
      })

      newLayer.id = id
      if (!newLayer.canMove) {
        newLayer.x = 0
        newLayer.y = 0
      }

      layersAdapter.setOne(state, newLayer)
    },
    restoreDefaults: (state, action) => {
      const id = action.payload
      const { type, name } = state.entities[id]
      const layer = new Layer(type)

      layer.getInitialState()
      layersAdapter.setOne(state, {
        id,
        name,
        ...layer.getInitialState(),
      })
    },
    setCurrentLayer: (state, action) => {
      const id = action.payload

      if (state.entities[id]) {
        state.current = id
        state.selected = id
      }
    },
  },
})

// ------------------------------
// Compound actions (thunks) that make multiple changes to the store across reducers,
// but only render once.
// ------------------------------

export const deleteLayer = (id) => {
  return (dispatch, getState) => {
    const state = getState()
    const layer = selectById(state, id)

    // delete the effects, and then delete the layer
    layer.effectIds.forEach((effectId) => {
      dispatch(effectsSlice.actions.deleteEffect(effectId))
    })
    dispatch(layersSlice.actions.deleteLayer(id))
  }
}

export const copyLayer = ({ id, name }) => {
  return (dispatch, getState) => {
    const state = getState()
    const layer = selectById(state, id)
    const newLayer = {
      ...layer,
      name,
    }

    // copy effects
    newLayer.effectIds = layer.effectIds.map((effectId) => {
      const effect = selectEffectById(state, effectId)
      return dispatch(effectsSlice.actions.addEffect(effect)).meta.id
    })

    // create new layer
    dispatch(layersSlice.actions.addLayer(newLayer))
  }
}

export const addEffect = ({ id, effect }) => {
  return (dispatch) => {
    // create the effect first, and then add it to the layer
    const action = dispatch(effectsSlice.actions.addEffect(effect))
    dispatch(layersSlice.actions.addEffect({ id, effectId: action.meta.id }))
  }
}

export const deleteEffect = ({ id, effectId }) => {
  return (dispatch) => {
    dispatch(layersSlice.actions.removeEffect({ id, effectId }))
    dispatch(effectsSlice.actions.deleteEffect(effectId))
  }
}

export default layersSlice.reducer
export const { actions: layersActions } = layersSlice
export const {
  addLayer,
  changeModelType,
  moveEffect,
  moveLayer,
  removeEffect,
  restoreDefaults,
  setCurrentLayer,
  updateLayer,
} = layersSlice.actions

// ------------------------------
// Selectors
// ------------------------------

// used in slice
const { selectById } = layersAdapter.getSelectors((state) => state.layers)

export const {
  selectAll: selectAllLayers,
  selectIds: selectLayerIds,
  selectEntities: selectLayerEntities,
} = layersAdapter.getSelectors((state) => state.layers)

export const selectLayers = createSelector(selectState, (state) => state.layers)

// the default selectLayerById selector created by the layer entity adapter only caches
// the latest invocation. The cached selector caches all invocations.
export const selectLayerById = createCachedSelector(
  selectLayers,
  (state, id) => id,
  (layers, id) => layers.entities[id],
)((state, id) => id)

const selectCurrentLayerId = createSelector(
  selectLayers,
  (layers) => layers.current,
)

export const selectCurrentLayer = createSelector(
  [selectLayerEntities, selectCurrentLayerId],
  (layers, current) => {
    return layers[current]
  },
)

export const selectVisibleLayerIds = createSelector(
  [selectLayerIds, selectLayerEntities],
  (layerIds, layers) => {
    return layerIds.filter((id) => layers[id].visible)
  },
)

export const selectNumLayers = createSelector(selectLayerIds, (layerIds) => {
  log("getNumLayer")
  return layerIds.length
})

// puts the current layer last in the list to ensure it can be rotated; else
// the handle will not rotate
export const selectKonvaLayerIds = createSelector(
  [selectCurrentLayer, selectVisibleLayerIds],
  (currentLayer, visibleLayerIds) => {
    const kIds = visibleLayerIds.filter((id) => id !== currentLayer.id)
    if (currentLayer.visible) {
      kIds.push(currentLayer.id)
    }
    return kIds
  },
)

export const selectIsDragging = createSelector(
  [selectLayerIds, selectLayerEntities],
  (ids, layers) => {
    log("selectIsDragging")
    return (
      ids.filter((id) => layers[id].visible && layers[id].dragging).length > 0
    )
  },
)

export const selectNumVisibleLayers = createSelector(
  selectVisibleLayerIds,
  (layers) => {
    return layers.length
  },
)

// deep equal selector is needed here because selectVisibleLayerIds will return a different
// array reference as input every time its inputs change
export const selectLayerIndexById = createCachedSelector(
  (state, id) => id,
  selectVisibleLayerIds,
  (layerId, visibleLayerIds) => {
    return visibleLayerIds.findIndex((id) => id === layerId)
  },
)({
  selectorCreator: createDeepEqualSelector,
  keySelector: (state, id) => id,
})

// TODO: replace this
// returns any effects tied to a given layer; memoizeArrayProducingFn will ensure we
// only recompute transformed vertices when an effect changes.
export const selectLayerEffectsById = createCachedSelector(
  (state, id) => id,
  selectLayerEntities,
  selectVisibleLayerIds,
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
