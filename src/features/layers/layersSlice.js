import { createSlice, createEntityAdapter } from "@reduxjs/toolkit"
import { createSelector, createSelectorCreator, defaultMemoize } from "reselect"
import { createCachedSelector } from "re-reselect"
import { v4 as uuidv4 } from "uuid"
import Color from "color"
import arrayMove from "array-move"
import { isEqual } from "lodash"
import { rotate, offset } from "@/common/geometry"
import { orderByKey } from "@/common/util"
import {
  getDefaultShapeType,
  getShapeFromType,
} from "@/features/shapes/factory"
import Layer from "./Layer"
import { selectState } from "@/features/app/appSlice"
import {
  effectsSlice,
  selectEffectById,
  selectEffectsByLayerId,
} from "@/features/effects/effectsSlice"
import {
  selectMachine,
  getMachineInstance,
} from "@/features/machine/machineSlice"
import { selectPreviewState } from "@/features/preview/previewSlice"
import { log } from "@/common/debugging"

// ------------------------------
// Slice, reducers and atomic actions
// ------------------------------

const layersAdapter = createEntityAdapter()
const defaultLayer = new Layer(getDefaultShapeType())
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
            layer.effect ? "defaultEffect" : "defaultShape",
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
      const instance = new Layer(type)
      const newLayer = instance.getInitialState()

      Object.keys(newLayer).forEach((attr) => {
        if (
          !notCopiedWhenTypeChanges.includes(attr) &&
          layer[attr] != undefined
        ) {
          newLayer[attr] = layer[attr]
        }
      })

      newLayer.id = id
      if (!instance.model.canMove) {
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
    const action = dispatch(
      effectsSlice.actions.addEffect({
        ...effect,
        layerId: id,
      }),
    )
    dispatch(layersSlice.actions.addEffect({ id, effectId: action.meta.id }))
  }
}

export const deleteEffect = ({ id, effectId }) => {
  return (dispatch, getState) => {
    const state = getState()
    const effectIds = selectCurrentLayer(state).effectIds
    const deleteIdx = effectIds.findIndex((id) => id === effectId)

    dispatch(layersSlice.actions.removeEffect({ id, effectId }))
    dispatch(effectsSlice.actions.deleteEffect(effectId))

    if (effectIds.length > 1) {
      dispatch(effectsSlice.actions.setCurrentEffect(effectIds[deleteIdx - 1]))
    }
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
  selectTotal: selectNumLayers,
} = layersAdapter.getSelectors((state) => state.layers)

export const selectLayers = createSelector(selectState, (state) => state.layers)

// the default selectLayerById selector created by the layer entity adapter only caches
// the latest invocation. The cached selector caches all invocations.
export const selectLayerById = createCachedSelector(
  selectLayers,
  (state, id) => id,
  (layers, id) => layers.entities[id],
)((state, id) => id)

// by returning null for shapes which don't use machine settings, this selector will ensure
// transformed vertices are not redrawn when machine settings change
export const selectLayerMachine = createCachedSelector(
  selectLayerById,
  selectMachine,
  (layer, machine) => {
    const shape = getShapeFromType(layer.type)
    return shape.usesMachine ? machine : null
  },
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

export const selectLayerIndex = createCachedSelector(
  (state, id) => id,
  selectVisibleLayerIds,
  (layerId, visibleLayerIds) => {
    return visibleLayerIds.findIndex((id) => id === layerId)
  },
)((state, id) => id)

// returns a list of ordered effects for a given layer
export const selectLayerEffects = createCachedSelector(
  selectLayerById,
  selectEffectsByLayerId,
  (layer, effects) => {
    return orderByKey(layer.effectIds, effects)
  },
)((state, id) => id)

// returns a list of visible ordered effects for a given layer
export const selectVisibleLayerEffects = createCachedSelector(
  selectLayerEffects,
  (effects) => {
    return effects.filter((effect) => effect.visible)
  },
)((state, id) => id)

// returns the vertices for a given layer
export const selectLayerVertices = createCachedSelector(
  selectLayerById,
  selectVisibleLayerEffects,
  selectLayerMachine,
  (layer, effects, machine) => {
    const instance = new Layer(layer.type)
    return instance.getVertices({ layer, effects, machine })
  },
)({
  keySelector: (state, id) => id,
  selectorCreator: createSelectorCreator(defaultMemoize, {
    equalityCheck: isEqual,
  }),
})

// returns the machine-bound vertices for a given layer
const selectMachineVertices = createCachedSelector(
  (state, id) => id,
  selectLayerVertices,
  selectLayerIndex,
  selectNumVisibleLayers,
  selectMachine,
  (id, vertices, layerIndex, numLayers, machine) => {
    log("selectMachineVertices", id)
    if (vertices.length > 0) {
      const layerInfo = {
        start: layerIndex === 0,
        end: layerIndex === numLayers - 1,
      }
      const machineInstance = getMachineInstance(vertices, machine, layerInfo)
      return machineInstance.polish().vertices
    }
  },
)((state, id) => id)

// creates a selector that returns previewable vertices for a given layer
export const selectPreviewVertices = createCachedSelector(
  selectLayerVertices,
  selectMachineVertices,
  selectLayerById,
  (originalVertices, computedVertices, layer, foo, bar) => {
    log("selectPreviewVertices", layer.id)
    const vertices = layer.dragging ? originalVertices : computedVertices

    return vertices.map((vertex) => {
      let previewVertex = rotate(
        offset(vertex, -layer.x, -layer.y),
        layer.rotation,
      )

      // store original coordinates
      previewVertex.origX = vertex.x
      previewVertex.origY = vertex.y

      return previewVertex
    })
  },
)((state, id) => id)

// returns a array of all visible machine-bound vertices and the connections between them
export const selectConnectedVertices = createSelector(selectState, (state) => {
  if (!state.fonts.loaded) {
    return []
  } // wait for fonts

  log("selectConnectedVertices")
  const visibleLayerIds = selectVisibleLayerIds(state)

  return visibleLayerIds
    .map((id, idx) => {
      const vertices = selectMachineVertices(state, id)
      const connector = selectConnectingVertices(state, id)
      return [...vertices, ...connector]
    })
    .flat()
})

// returns an array of vertices connecting a given layer to the next (if it exists)
export const selectConnectingVertices = createCachedSelector(
  (state, id) => id,
  selectState,
  (layerId, state) => {
    log("selectConnectingVertices")

    const visibleLayerIds = selectVisibleLayerIds(state)
    const idx = selectLayerIndex(state, layerId)

    if (idx == visibleLayerIds.length - 1) {
      // last vertex
      return []
    }

    const endId = visibleLayerIds[idx + 1]
    const startLayer = selectLayerById(state, layerId)
    const endLayer = selectLayerById(state, endId)
    const startVertices = selectMachineVertices(state, startLayer.id)
    const endVertices = selectMachineVertices(state, endLayer.id)
    const start = startVertices[startVertices.length - 1]
    const end = endVertices[0]

    if (startLayer.connectionMethod === "along perimeter") {
      const machineInstance = getMachineInstance([], state.machine)
      const startPerimeter = machineInstance.nearestPerimeterVertex(start)
      const endPerimeter = machineInstance.nearestPerimeterVertex(end)
      const perimeterConnection = machineInstance.tracePerimeter(
        startPerimeter,
        endPerimeter,
      )

      return [
        start,
        startPerimeter,
        perimeterConnection,
        endPerimeter,
        end,
      ].flat()
    } else {
      return [start, end]
    }
  },
)((state, id) => id)

// returns the starting offset for each layer, given previous layers
export const selectVertexOffsets = createSelector(selectState, (state) => {
  log("selectVertexOffsets")
  const visibleLayerIds = selectVisibleLayerIds(state)
  let offsets = {}
  let offset = 0

  visibleLayerIds.forEach((id) => {
    const vertices = selectMachineVertices(state, id)
    const connector = selectConnectingVertices(state, id)
    offsets[id] = { start: offset, end: offset + vertices.length - 1 }

    if (connector.length > 0) {
      offsets[id + "-connector"] = {
        start: offset + vertices.length,
        end: offset + vertices.length + connector.length - 1,
      }
      offset += vertices.length + connector.length
    }
  })

  return offsets
})

// returns statistics across all layers
export const selectVerticesStats = createSelector(
  selectConnectedVertices,
  (vertices) => {
    let distance = 0.0
    let previous = null

    vertices.forEach((vertex) => {
      if (previous && vertex) {
        distance += Math.sqrt(
          Math.pow(vertex.x - previous.x, 2.0) +
            Math.pow(vertex.y - previous.y, 2.0),
        )
      }
      previous = vertex
    })

    log("getVerticeStats")
    return {
      numPoints: vertices.length,
      distance: Math.floor(distance),
    }
  },
)

// given a set of vertices and a slider value, returns the indices of the
// start and end vertices representing a preview slider moving through them.
export const selectSliderBounds = createSelector(
  [selectConnectedVertices, selectPreviewState],
  (vertices, preview) => {
    const slideSize = 2.0
    const beginFraction = preview.sliderValue / 100.0
    const endFraction = (slideSize + preview.sliderValue) / 100.0
    let start = Math.round(vertices.length * beginFraction)
    let end = Math.round(vertices.length * endFraction)

    if (end >= vertices.length) {
      end = vertices.length - 1
    }

    if (start > 0 && end - start <= 1) {
      if (start < 1) {
        end = Math.min(vertices.length, 1)
      } else {
        start = end - 1
      }
    }

    return { start, end }
  },
)

// returns a hash of { index => color } that specifies the gradient color of the
// line drawn at each index.
export const selectSliderColors = createSelector(
  [selectSliderBounds, selectVertexOffsets],
  (bounds, offsets) => {
    log("selectSliderColors")
    const colors = {}
    const { start, end } = bounds

    if (end !== start) {
      let startColor = Color("yellow")
      const colorStep = 3.0 / 8 / (end - start)

      for (let i = end; i >= start; i--) {
        colors[i] = startColor.darken(colorStep * (end - i)).hex()
      }
    }

    return colors
  },
)

// TODO: fix or remove
// used by the preview window; reverses rotation and offsets because they are
// re-added by Konva transformer.
/*
export const makeGetPreviewTrackVertices = (layerId) => {
  return createSelector(
    getCachedSelector(makeGetLayer, layerId),
    (layer) => {
      log("makeGetPreviewTrackVertices", layerId)
      let trackVertices = []

      const numLoops = layer.numLoops
      for (var i=0; i<numLoops; i++) {
      if (layer.trackEnabled) {
      trackVertices.push(transformShape(layer, new Victor(0.0, 0.0), i, i))
      }
    }

      return trackVertices.map((vertex) => {
        return rotate(offset(vertex, -layer.x, -layer.y), layer.rotation)
      })
    },
  )
}
*/
