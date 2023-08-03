import { createSlice } from "@reduxjs/toolkit"
import { createSelector } from "reselect"
import Color from "color"
import { getModelFromType } from "@/config/models"
import { rotate, offset } from "@/common/geometry"
import { log } from "@/common/debugging"
import { selectState } from "@/features/app/appSlice"
import { selectPreviewState } from "@/features/preview/previewSlice"
import { createCachedSelector } from "re-reselect"
import {
  selectLayerById,
  selectNumVisibleLayers,
  selectVisibleLayerIds,
  selectLayerEffectsById,
  selectLayerIndexById,
} from "@/features/layers/layersSlice"
import Layer from "@/features/layers/Layer"
import { transformShapes, polishVertices, getMachineInstance } from "./computer"

// ------------------------------
// Slice, reducers and atomic actions
// ------------------------------

const machineSlice = createSlice({
  name: "machine",
  initialState: {
    rectangular: true,
    rectExpanded: false,
    polarExpanded: false,
    minX: 0,
    maxX: 500,
    minY: 0,
    maxY: 500,
    maxRadius: 250,
    minimizeMoves: false,
    rectOrigin: [],
    polarStartPoint: "none",
    polarEndPoint: "none",
  },
  reducers: {
    updateMachine(state, action) {
      Object.assign(state, action.payload)
    },
    toggleMachineRectExpanded(state, action) {
      state.rectangular = true
      state.rectExpanded = !state.rectExpanded
      state.polarExpanded = false
    },
    toggleMachinePolarExpanded(state, action) {
      state.rectangular = false
      state.rectExpanded = false
      state.polarExpanded = !state.polarExpanded
    },
    setMachineRectOrigin(state, action) {
      let newValue = []
      let value = action.payload

      for (let i = 0; i < value.length; i++) {
        if (!state.rectOrigin.includes(value[i])) {
          newValue.push(value[i])
          break
        }
      }
      state.rectOrigin = newValue
    },
    toggleMinimizeMoves(state, action) {
      state.minimizeMoves = !state.minimizeMoves
    },
  },
})

export const {
  updateMachine,
  toggleMachineRectExpanded,
  toggleMachinePolarExpanded,
  setMachineRectOrigin,
  setMachineSize,
  toggleMinimizeMoves,
} = machineSlice.actions

export default machineSlice.reducer

export const selectMachine = createSelector(
  selectState,
  (state) => state.machine,
)

// ------------------------------
// Selectors
// ------------------------------

// by returning null for shapes which don't use machine settings, this selector will ensure
// transformed vertices are not redrawn when machine settings change
export const selectLayerMachine = createCachedSelector(
  selectLayerById,
  selectMachine,
  (layer, machine) => {
    const model = getModelFromType(layer.type)
    return model.usesMachine ? machine : null
  },
)((state, id) => id)

// creates a selector that returns shape vertices for a given layer
const selectLayerVerticesById = createCachedSelector(
  selectLayerById,
  selectLayerMachine,
  (layer, machine) => {
    const state = {
      shape: layer,
      machine,
    }
    log("selectLayerVerticesById", layer.id)
    const layerInstance = new Layer(layer.type)

    if (!state.shape.dragging && state.shape.effect) {
      return []
    } else {
      return layerInstance.draw(state)
    }
  },
)((state, id) => id)

// creates a selector that returns transformed vertices for a given layer
const selectTransformedVerticesById = createCachedSelector(
  selectLayerVerticesById,
  selectLayerById,
  selectLayerEffectsById,
  (vertices, layer, effects) => {
    log("selectTransformedVerticesById", layer.id)
    return transformShapes(vertices, layer, effects)
  },
)((state, id) => id)

// creates a selector that returns computed (machine-bound) vertices for a given layer
const selectComputedVerticesById = createCachedSelector(
  (state, id) => id,
  selectTransformedVerticesById,
  selectLayerIndexById,
  selectNumVisibleLayers,
  selectMachine,
  (id, vertices, layerIndex, numLayers, machine) => {
    log("selectComputedVerticesById", id)
    return polishVertices(vertices, machine, {
      start: layerIndex === 0,
      end: layerIndex === numLayers - 1,
    })
  },
)((state, id) => id)

// creates a selector that returns previewable vertices for a given layer
export const selectPreviewVerticesById = createCachedSelector(
  selectTransformedVerticesById,
  selectComputedVerticesById,
  selectLayerById,
  (transformedVertices, computedVertices, layer, foo, bar) => {
    log("selectPreviewVerticesById", layer.id)
    const vertices = layer.dragging ? transformedVertices : computedVertices

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

// returns a flattened array of all visible computed vertices and connectors (across layers)
export const selectComputedVertices = createSelector(selectState, (state) => {
  if (!state.fonts.loaded) {
    return []
  } // wait for fonts

  log("selectComputedVertices")
  const visibleLayerIds = selectVisibleLayerIds(state)

  return visibleLayerIds
    .map((id, idx) => {
      const vertices = selectComputedVerticesById(state, id)
      const connector = selectConnectingVerticesById(state, id)
      return [...vertices, ...connector]
    })
    .flat()
})

// returns an array of vertices connecting a given layer to the next (if it exists)
export const selectConnectingVerticesById = createCachedSelector(
  (state, id) => id,
  selectState,
  (layerId, state) => {
    log("selectConnectingVerticesById")
    const visibleLayerIds = selectVisibleLayerIds(state)
    const idx = selectLayerIndexById(state, layerId)

    if (idx > visibleLayerIds.length - 2) {
      return []
    }

    const endId = visibleLayerIds[idx + 1]
    const startLayer = selectLayerById(state, layerId) //|| selectCurrentLayer(state)
    const endLayer = selectLayerById(state, endId) //|| selectCurrentLayer(state)
    const startVertices = selectComputedVerticesById(state, startLayer.id)
    const endVertices = selectComputedVerticesById(state, endLayer.id)
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
export const selectVertexOffsets = createSelector([selectState], (state) => {
  log("selectVertexOffsets")
  const visibleLayerIds = selectVisibleLayerIds(state)
  let offsets = {}
  let offset = 0

  visibleLayerIds.forEach((id) => {
    const vertices = selectComputedVerticesById(state, id)
    const connector = selectConnectingVerticesById(state, id)
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
  selectComputedVertices,
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
  [selectComputedVertices, selectPreviewState],
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
