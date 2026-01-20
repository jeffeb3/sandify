/* global localStorage */

import { createSlice, createEntityAdapter } from "@reduxjs/toolkit"
import { createSelector, createSelectorCreator, lruMemoize } from "reselect"
import { createCachedSelector } from "re-reselect"
import { v4 as uuidv4 } from "uuid"
import Color from "color"
import { arrayMoveImmutable } from "array-move"
import { isEqual } from "lodash"
import {
  totalDistance,
  findBounds,
  cloneVertex,
  resizeVertices,
  cloneVertices,
  centerOnOrigin,
  toLocalSpace,
} from "@/common/geometry"
import { traceBoundary } from "@/common/boundary"
import { orderByKey } from "@/common/util"
import { insertOne, prepareAfterAdd } from "@/common/slice"
import { getDefaultShapeType, getShape } from "@/features/shapes/shapeFactory"
import Layer from "./Layer"
import EffectLayer from "@/features/effects/EffectLayer"
import { selectState } from "@/features/app/appSlice"
import {
  effectsSlice,
  setSelectedEffect,
  selectEffectById,
  selectEffectsByLayerId,
  selectCurrentEffect,
  selectSelectedEffectId,
} from "@/features/effects/effectsSlice"
import { imagesSlice, addImage, loadImage } from "@/features/images/imagesSlice"
import { selectFontLoaded } from "@/features/fonts/fontsSlice"
import { selectImagesLoaded } from "@/features/images/imagesSlice"
import { selectCurrentMachine } from "@/features/machines/machinesSlice"
import { getMachine } from "@/features/machines/machineFactory"
import { selectPreviewState } from "@/features/preview/previewSlice"
import { log } from "@/common/debugging"

// ------------------------------
// Slice, reducers and atomic actions
// ------------------------------

const adapter = createEntityAdapter()
const defaultLayer = new Layer(getDefaultShapeType())
const defaultLayerId = uuidv4()
const layerState = {
  id: defaultLayerId,
  ...defaultLayer.getInitialState(),
}
const notCopiedWhenTypeChanges = ["type"]

const layersSlice = createSlice({
  name: "layers",
  initialState: adapter.getInitialState({
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
        const layer = insertOne(state, action)

        state.selected = layer.id
        layer.effectIds = []
        if (layer.type !== "fileImport" && layer.type !== "imageImport") {
          localStorage.setItem("defaultShape", layer.type)
        }
      },
      prepare(layer) {
        return prepareAfterAdd(layer)
      },
    },
    deleteLayer: (state, action) => {
      adapter.removeOne(state, action)
    },
    moveLayer: (state, action) => {
      const { oldIndex, newIndex } = action.payload
      state.ids = arrayMoveImmutable(state.ids, oldIndex, newIndex)
    },
    updateLayer: (state, action) => {
      const changes = action.payload
      const layer = state.entities[changes.id]
      const shape = getShape(layer.type)

      shape.handleUpdate(layer, changes)
      adapter.updateOne(state, { id: changes.id, changes })
    },
    addEffect: (state, action) => {
      const { id, effectId, afterId } = action.payload
      const effectIds = state.entities[id].effectIds

      let index
      if (afterId) {
        index = effectIds.findIndex((id) => id == afterId)
        if (index == -1) {
          index = null
        }
      }
      index = index + 1 || effectIds.length

      effectIds.splice(index, 0, effectId)
    },
    moveEffect: (state, action) => {
      const { id, oldIndex, newIndex } = action.payload
      const layer = state.entities[id]

      layer.effectIds = arrayMoveImmutable(layer.effectIds, oldIndex, newIndex)
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
      if (!instance.model.canMove(state)) {
        newLayer.x = 0
        newLayer.y = 0
      }

      if (!instance.model.canRotate(state)) {
        newLayer.rotation = 0
      }

      adapter.setOne(state, newLayer)
    },
    randomizeValues: (state, action) => {
      const id = action.payload
      const layer = state.entities[id]
      const shape = getShape(layer.type)
      const changes = shape.randomChanges(layer)

      shape.handleUpdate(layer, changes)
      adapter.updateOne(state, { id: changes.id, changes })
    },
    restoreDefaults: (state, action) => {
      const { id, machine } = action.payload
      const { type, name, effectIds } = state.entities[id]
      const layer = new Layer(type)
      const layerProps = { machine }

      adapter.setOne(state, {
        id,
        name,
        ...layer.getInitialState(layerProps),
        effectIds,
      })
    },
    setCurrentLayer: (state, action) => {
      const id = action.payload

      if (!id) {
        state.current = null
      } else if (state.entities[id]) {
        state.current = id
        state.selected = id
      }
    },
    setSelectedLayer: (state, action) => {
      const id = action.payload

      if (state.entities[id]) {
        state.selected = id
      }
    },
  },
})

// ------------------------------
// Selectors
// ------------------------------

// used in slice
const { selectById } = adapter.getSelectors((state) => state.layers)

// returns vertices suitable for display in the preview window
const previewVertices = (vertices, layer) => {
  return vertices.map((vertex) => {
    vertex = cloneVertex(vertex)

    let previewVertex = toLocalSpace(vertex, layer.x, layer.y, layer.rotation)

    // store original coordinates
    previewVertex.origX = vertex.x
    previewVertex.origY = vertex.y

    return previewVertex
  })
}

export const {
  selectAll: selectAllLayers,
  selectIds: selectLayerIds,
  selectEntities: selectLayerEntities,
  selectTotal: selectNumLayers,
} = adapter.getSelectors((state) => state.layers)

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
  selectCurrentMachine,
  (layer, machine) => {
    if (!layer) {
      return null
    } // zombie child

    const shape = getShape(layer.type)
    return shape.usesMachine ? machine : null
  },
)((state, id) => id)

const selectLayerDependentsLoaded = createCachedSelector(
  selectLayerById,
  selectImagesLoaded,
  (state, id) => state,
  (layer, imagesLoaded, state) => {
    if (!layer) {
      return false
    }

    const shape = getShape(layer.type)
    const fontLoaded =
      !shape.usesFonts ||
      selectFontLoaded(state, layer.fancyFont, layer.fancyFontWeight)
    const imagesReady = !layer.imageId || imagesLoaded

    return fontLoaded && imagesReady
  },
)((state, id) => id)

export const selectCurrentLayerId = createSelector(
  selectLayers,
  (layers) => layers.current,
)

export const selectSelectedLayerId = createSelector(
  selectLayers,
  (layers) => layers.selected,
)

export const selectCurrentLayer = createSelector(
  [selectLayerEntities, selectCurrentLayerId],
  (layers, currentId) => {
    return layers[currentId]
  },
)

export const selectSelectedLayer = createSelector(
  [selectLayerEntities, selectSelectedLayerId],
  (layers, selectedId) => {
    return layers[selectedId]
  },
)

export const selectVisibleLayerIds = createSelector(
  [selectLayerIds, selectLayerEntities],
  (layerIds, layers) => {
    return layerIds.filter((id) => layers[id].visible)
  },
)

// Check if all fonts needed by visible FancyText layers are loaded
export const selectFontsLoaded = createSelector(selectState, (state) => {
  const visibleLayerIds = selectVisibleLayerIds(state)

  return visibleLayerIds.every((id) => {
    const layer = selectLayerById(state, id)

    if (layer.type !== "fancyText") return true
    return selectFontLoaded(
      state,
      layer.fancyFont,
      layer.fancyFontWeight || "Regular",
    )
  })
})

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
    // guard vs zombie child
    return (layer && orderByKey(layer.effectIds, effects)) || []
  },
)((state, id) => id)

// returns a list of visible ordered effects for a given layer
export const selectVisibleLayerEffects = createCachedSelector(
  selectLayerEffects,
  (effects) => {
    return effects.filter((effect) => effect.visible)
  },
)((state, id) => id)

export const selectActiveEffect = createCachedSelector(
  selectLayerById,
  selectCurrentEffect,
  (layer, currentEffect) => {
    if (!layer) {
      return null
    }
    if (layer.effectIds.includes(currentEffect?.id)) {
      return currentEffect
    }
  },
)((state, id) => id)

export const selectAllImageIds = createSelector([selectAllLayers], (layers) => {
  return layers.map((layer) => layer.imageId).filter((id) => id)
})

// Returns the mask source layer's vertices when a mask effect has maskLayerId set
// Validates that the source layer exists and precedes the target layer
// Safe because layers are computed in order, so preceding layer is already cached
// Note: invisible layers can still be mask sources
const selectMaskSourceVertices = (state, layerId) => {
  // Get the layer's visible effects
  const effects = selectVisibleLayerEffects(state, layerId)

  // Find mask effect with maskMachine === "layer" and maskLayerId set
  const maskEffect = effects.find(
    (e) => e.type === "mask" && e.maskMachine === "layer" && e.maskLayerId,
  )
  if (!maskEffect) return null

  const maskLayerId = maskEffect.maskLayerId

  // Validate: source layer must exist and precede target (visibility not required)
  const allLayerIds = selectLayerIds(state)
  const thisIdx = allLayerIds.indexOf(layerId)
  const sourceIdx = allLayerIds.indexOf(maskLayerId)

  // Invalid if: doesn't exist or comes after this layer
  if (sourceIdx === -1 || sourceIdx >= thisIdx) return null

  // Return source layer's vertices (computed on demand even if invisible)
  return selectLayerVertices(state, maskLayerId)
}

// returns the vertices for a given layer
export const selectLayerVertices = createCachedSelector(
  selectLayerById,
  selectVisibleLayerEffects,
  selectLayerMachine,
  selectLayerDependentsLoaded,
  (state, id) => selectMaskSourceVertices(state, id),
  (layer, effects, machine, _dependentsLoaded, maskSourceVertices) => {
    if (!layer) {
      return []
    } // zombie child

    const instance = new Layer(layer.type)
    return instance.getVertices({ layer, effects, machine, maskSourceVertices })
  },
)({
  keySelector: (state, id) => id,
  selectorCreator: createSelectorCreator(lruMemoize, {
    equalityCheck: isEqual,
  }),
})

// returns the machine-bound vertices for a given layer
const selectMachineVertices = createCachedSelector(
  (state, id) => id,
  selectLayerVertices,
  selectLayerIndex,
  selectLayerById,
  selectNumVisibleLayers,
  selectCurrentMachine,
  (id, vertices, layerIndex, layer, numLayers, machine) => {
    if (!machine) {
      return [] // zombie child
    }

    log("selectMachineVertices", id)
    if (vertices.length > 0) {
      const layerInfo = {
        start: layerIndex === 0,
        end: layerIndex === numLayers - 1,
      }

      return getMachine(machine).polish(vertices, layerInfo)
    } else {
      return []
    }
  },
)((state, id) => id)

// returns preview vertices for a given layer, without effects
export const selectShapePreviewVertices = createCachedSelector(
  selectLayerById,
  selectVisibleLayerEffects,
  selectLayerMachine,
  selectLayerDependentsLoaded,
  (layer, effects, machine, fontsLoaded) => {
    if (!layer) {
      return []
    } // zombie child

    const instance = new Layer(layer.type)
    const vertices = instance.getVertices({
      layer,
      effects: [],
      machine,
    })

    return previewVertices(vertices, layer)
  },
)({
  keySelector: (state, id) => id,
  selectorCreator: createSelectorCreator(lruMemoize, {
    equalityCheck: isEqual,
  }),
})

// creates a selector that returns previewable vertices for a given layer
export const selectPreviewVertices = createCachedSelector(
  selectLayerVertices,
  selectMachineVertices,
  selectLayerById,
  (originalVertices, machineVertices, layer) => {
    if (!layer) {
      return []
    } // zombie child

    log("selectPreviewVertices", layer.id)
    const vertices = layer.dragging ? originalVertices : machineVertices
    return previewVertices(vertices, layer)
  },
)((state, id) => id)

// returns the preview vertices for a dragging effect; this includes all effects up to
// the given effect
export const selectDraggingEffectVertices = createCachedSelector(
  (state, id, effectId) => effectId,
  selectVisibleLayerEffects,
  selectLayerById,
  selectLayerMachine,
  (effectId, effects, layer, machine) => {
    if (!layer) {
      return []
    } // zombie child

    const instance = new Layer(layer.type)
    const effect = effects.find((effect) => effect.id == effectId)

    if (!effect) {
      // no longer visible
      return []
    }

    const effectInstance = new EffectLayer(effect.type)
    const idx = effects.findIndex((effect) => effect.id == effectId)
    const vertices = effectInstance.model.dragPreview
      ? instance.getVertices({
          layer,
          effects: effects.slice(0, idx + 1),
          machine,
        })
      : []

    return previewVertices(previewVertices(vertices, layer), effect)
  },
)({
  keySelector: (state, id, effectId) => id + effectId,
  selectorCreator: createSelectorCreator(lruMemoize, {
    equalityCheck: isEqual,
  }),
})

// returns the preview vertices for a layer when an effect is being dragged; this includes all
// effects up prior to the dragged effect
export const selectShapeWhileEffectDraggingVertices = createCachedSelector(
  (state, id, effectId) => effectId,
  selectVisibleLayerEffects,
  selectLayerById,
  selectLayerMachine,
  (effectId, effects, layer, machine) => {
    if (!layer || !effectId) {
      return []
    } // zombie child or inactive effect

    const instance = new Layer(layer.type)
    const effect = effects.find((effect) => effect.id == effectId)

    if (!effect) {
      // no longer visible
      return []
    }

    const idx = effects.findIndex((effect) => effect.id == effectId)
    const vertices = instance.getVertices({
      layer,
      effects: effects.slice(0, idx),
      machine,
    })

    return previewVertices(vertices, layer)
  },
)({
  keySelector: (state, id, effectId) => id + effectId,
  selectorCreator: createSelectorCreator(lruMemoize, {
    equalityCheck: isEqual,
  }),
})

// returns whether an upstream effect from the given effect is being dragged
export const selectIsUpstreamEffectDragging = createCachedSelector(
  selectEffectById,
  selectSelectedLayer,
  selectCurrentEffect,
  (effect, selectedLayer, currentEffect) => {
    if (
      !(effect && selectedLayer && currentEffect?.dragging) ||
      effect.id === currentEffect.id ||
      effect.layerId != currentEffect.layerId
    ) {
      return false
    }

    const idx = selectedLayer.effectIds.findIndex((id) => id === effect.id)
    const draggingIdx = selectedLayer.effectIds.findIndex(
      (id) => id === currentEffect.id,
    )

    return idx > draggingIdx
  },
)({
  keySelector: (state, id) => id,
  selectorCreator: createSelectorCreator(lruMemoize, {
    equalityCheck: isEqual,
  }),
})

// returns the selection vertices for an effect, with special handling for layer masks
export const selectEffectSelectionVertices = createCachedSelector(
  selectEffectById,
  (state, effectId) => {
    const effect = selectEffectById(state, effectId)
    if (
      effect?.type === "mask" &&
      effect?.maskMachine === "layer" &&
      effect?.maskLayerId
    ) {
      return selectLayerVertices(state, effect.maskLayerId)
    }
    return null
  },
  (effect, maskSourceVertices) => {
    if (!effect) {
      return []
    }

    // For layer masks with valid source, trace boundary then center and scale
    // (rotation is handled by Shape component's rotation prop)
    if (
      effect.type === "mask" &&
      effect.maskMachine === "layer" &&
      maskSourceVertices &&
      maskSourceVertices.length >= 3
    ) {
      // Trace boundary to handle self-intersecting shapes (e.g., Fractal Spirograph)
      const boundary = traceBoundary(maskSourceVertices)
      const centeredMask = centerOnOrigin(cloneVertices(boundary))

      const result = resizeVertices(
        cloneVertices(centeredMask),
        effect.width,
        effect.height,
        true,
      )

      // Ensure the selection path is closed
      if (result.length > 0) {
        const first = result[0]
        const last = result[result.length - 1]
        if (first.distance(last) > 0.01) {
          result.push(first.clone())
        }
      }

      return result
    }

    // Fall back to standard selection vertices
    const instance = new EffectLayer(effect.type)
    return instance.getSelectionVertices(effect)
  },
)({
  keySelector: (state, id) => id,
  selectorCreator: createSelectorCreator(lruMemoize, {
    equalityCheck: isEqual,
  }),
})

// returns a array of all visible machine-bound vertices and the connections between them
export const selectConnectedVertices = createSelector(selectState, (state) => {
  if (!selectFontsLoaded(state)) {
    return []
  }

  log("selectConnectedVertices")
  const visibleLayerIds = selectVisibleLayerIds(state)

  return visibleLayerIds.reduce((acc, id) => {
    const vertices = selectMachineVertices(state, id)
    const connector = selectConnectingVertices(state, id)

    acc.push(...vertices, ...connector.slice(1, -1))

    return acc
  }, [])
})

// returns an array of layers (and connectors) in an object structure designed to be exported by
// an exporter
export const selectLayersForExport = createSelector(selectState, (state) => {
  if (!selectFontsLoaded(state)) {
    return []
  }

  log("selectLayersForExport")
  const visibleLayerIds = selectVisibleLayerIds(state)
  let connectorCnt = 0

  return visibleLayerIds.reduce((acc, id, index) => {
    const vertices = selectMachineVertices(state, id)
    const connector = selectConnectingVertices(state, id)
    const effects = selectEffectsByLayerId(state, id)
    const info = selectLayerById(state, id)
    const codeEffects = effects.filter(
      (effect) => effect.type === "programCode",
    )

    acc.push({
      name: info.name,
      type: "LAYER",
      index,
      vertices,
      code: codeEffects.map((effect) => {
        return {
          pre: effect.programCodePre,
          post: effect.programCodePost,
        }
      }),
    })

    if (connector.length > 0) {
      acc.push({
        type: "CONNECTOR",
        index: connectorCnt,
        vertices: connector,
      })
      connectorCnt += 1
    }

    return acc
  }, [])
})

// returns an array of vertices connecting a given layer to the next (if it exists)
export const selectConnectingVertices = createCachedSelector(
  (state, id) => id,
  selectCurrentMachine,
  selectState,
  (layerId, machine, state) => {
    log("selectConnectingVertices", layerId)

    const visibleLayerIds = selectVisibleLayerIds(state)
    const idx = selectLayerIndex(state, layerId)

    if (idx == visibleLayerIds.length - 1) {
      // last vertex
      return []
    }

    const endId = visibleLayerIds[idx + 1]
    const startLayer = selectLayerById(state, layerId)
    const endLayer = selectLayerById(state, endId)

    if (!startLayer || !endLayer) {
      return [] // zombie child
    }

    const startVertices = selectMachineVertices(state, startLayer.id)
    const endVertices = selectMachineVertices(state, endLayer.id)
    const start = startVertices[startVertices.length - 1]
    const end = endVertices[0]

    if (startLayer.connectionMethod === "along perimeter") {
      const machineModel = getMachine(machine)
      const startPerimeter = machineModel.nearestPerimeterVertex(start)
      const endPerimeter = machineModel.nearestPerimeterVertex(end)
      const perimeterConnection = machineModel.tracePerimeter(
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
    log("getVerticeStats")
    return {
      numPoints: vertices.length,
      distance: Math.floor(totalDistance(vertices)),
    }
  },
)

// returns the bounds for a given preview layer; include the original shape
// in the bounds to compensate for potential masking
export const selectLayerPreviewBounds = createCachedSelector(
  selectLayerById,
  selectMachineVertices,
  selectVisibleLayerEffects,
  selectCurrentMachine,
  (state, id, isCurrent) => isCurrent,
  (layer, machineVertices, effects, machine, isCurrent) => {
    if (!layer) {
      // zombie child
      return []
    }

    const instance = new Layer(layer.type)
    const hasSelectableEffect = effects.find((effect) =>
      ["transformer", "mask"].includes(effect.type),
    )
    const hasInvertedMask = effects.find((effect) => effect.maskInvert)
    const includeVertices = !(hasSelectableEffect || hasInvertedMask)
    const includeLayer = isCurrent || includeVertices
    const includeEffects =
      !(isCurrent || hasInvertedMask) || !hasSelectableEffect

    const vertices = includeLayer
      ? instance.getVertices({
          layer,
          effects: [],
          machine,
          options: { bounds: true },
        })
      : []
    const effectVertices = includeEffects ? machineVertices : []

    const combinedVertices = [...vertices, ...effectVertices].flat()
    const previewedVertices = previewVertices(combinedVertices, layer)

    // don't include connector vertices
    return findBounds(previewedVertices.filter((vertex) => !vertex.connect))
  },
)({
  keySelector: (state, id, isCurrent) => `${id}-${isCurrent}`,
  selectorCreator: createSelectorCreator(lruMemoize, {
    equalityCheck: isEqual,
  }),
})

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

// ------------------------------
// Compound actions (thunks) that make multiple changes to the store across reducers,
// but only render once.
// ------------------------------

export const deleteLayer = (id) => {
  return (dispatch, getState) => {
    const state = getState()
    const ids = selectLayerIds(state)
    const deleteIdx = ids.findIndex((_id) => _id === id)
    const layer = selectById(state, id)
    const selectedLayerId = selectSelectedLayerId(state)

    // delete any effects and/or image, and then delete the layer
    layer.effectIds.forEach((effectId) => {
      dispatch(effectsSlice.actions.deleteEffect(effectId))
    })

    if (layer.imageId) {
      dispatch(imagesSlice.actions.deleteImage(layer.imageId))
    }

    dispatch(layersSlice.actions.deleteLayer(id))

    if (id === selectedLayerId) {
      // set a new current layer
      const newIds = ids.filter((i) => i != id)
      const idx = deleteIdx === ids.length - 1 ? deleteIdx - 1 : deleteIdx
      dispatch(setCurrentLayer(newIds[idx]))
    }
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

    // create new layer
    const action = dispatch(layersSlice.actions.addLayer(newLayer))
    const newId = action.meta.id

    // copy effects
    layer.effectIds.map((effectId) => {
      const effect = selectEffectById(state, effectId)
      return dispatch(addEffect({ id: newId, effect }))
    })

    dispatch(setCurrentLayer(newId))
  }
}

export const addEffect = ({ id, effect, afterId, randomize }) => {
  return (dispatch) => {
    // create the effect first, and then add it to the layer
    const action = dispatch(
      effectsSlice.actions.addEffect({
        ...effect,
        layerId: id,
      }),
    )
    const effectId = action.meta.id

    dispatch(layersSlice.actions.addEffect({ id, effectId, afterId }))

    if (randomize) {
      dispatch(effectsSlice.actions.randomizeValues(effectId))
    }

    dispatch(setCurrentEffect(id))
  }
}

export const deleteEffect = ({ id, effectId }) => {
  return (dispatch, getState) => {
    const state = getState()
    const effectIds = selectLayerById(state, id).effectIds
    const deleteIdx = effectIds.findIndex((id) => id === effectId)
    const selectedEffectId = selectSelectedEffectId(state)

    dispatch(layersSlice.actions.removeEffect({ id, effectId }))
    dispatch(effectsSlice.actions.deleteEffect(effectId))

    if (effectIds.length > 1) {
      if (effectId === selectedEffectId) {
        const newIds = effectIds.filter((i) => i != effectId)
        const idx =
          deleteIdx === effectIds.length - 1 ? deleteIdx - 1 : deleteIdx

        dispatch(setCurrentEffect(newIds[idx]))
      }
    } else {
      dispatch(setCurrentLayer(id))
    }
  }
}

export const setCurrentLayer = (id) => {
  return (dispatch, getState) => {
    const state = getState()

    if (id) {
      const layer = selectLayerById(state, id)
      dispatch(layersSlice.actions.setCurrentLayer(id))
      dispatch(effectsSlice.actions.setCurrentEffect(null))
      dispatch(setSelectedEffect(layer?.effectIds[0])) // this guard is a hack to get a test to run
    } else {
      dispatch(layersSlice.actions.setCurrentLayer(null))
      dispatch(effectsSlice.actions.setCurrentEffect(null))
    }
  }
}

export const setCurrentEffect = (id) => {
  return (dispatch, getState) => {
    const state = getState()
    dispatch(effectsSlice.actions.setCurrentEffect(id))

    const effect = selectEffectById(state, id)
    dispatch(layersSlice.actions.setCurrentLayer(null))
    dispatch(layersSlice.actions.setSelectedLayer(effect?.layerId))
  }
}

export const addLayerWithImage = ({ layerProps, image }) => {
  return async (dispatch) => {
    const action = dispatch(addImage(image))
    const imageId = action.meta.id

    await dispatch(loadImage({ imageId, imageSrc: image.src }))

    const layerInstance = new Layer("imageImport")
    const layerWithImage = {
      ...layerInstance.getInitialState({
        ...layerProps,
        imageId,
      }),
      name: layerProps.name,
      imageId,
    }

    dispatch(layersSlice.actions.addLayer(layerWithImage))
  }
}

export const addLayerWithRandomValues = ({ layer, randomize }) => {
  return async (dispatch) => {
    const action = dispatch(layersSlice.actions.addLayer(layer))
    const layerId = action.meta.id

    if (randomize) {
      dispatch(randomizeValues(layerId))
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
  randomizeValues,
  removeEffect,
  restoreDefaults,
  setSelectedLayer,
  updateLayer,
} = layersSlice.actions
