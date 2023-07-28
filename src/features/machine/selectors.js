import LRUCache from "lru-cache"
import { createSelector } from "reselect"
import Color from "color"
import {
  getMachineState,
  getPreviewState,
  getState,
} from "@/features/store/selectors"
import { createCachedSelector } from "re-reselect"
import {
  getLayer,
  getNumVisibleLayers,
  getVisibleNonEffectIds,
  getLayerEffects,
  getNonEffectLayerIndex,
} from "@/features/layers/selectors"
import Layer from "@/features/layers/Layer"
import { getModelFromType } from "@/config/models"
import { rotate, offset } from "@/common/geometry"
import { log } from "@/common/debugging"
import { transformShapes, polishVertices, getMachineInstance } from "./computer"

const cache = new LRUCache({
  length: (n, key) => {
    return n.length
  },
  max: 500000,
})

const getCacheKey = (state) => {
  return JSON.stringify(state)
}

// by returning null for shapes which don't use machine settings, this selector will ensure
// transformed vertices are not redrawn when machine settings change

export const getLayerMachine = createCachedSelector(
  getLayer,
  getMachineState,
  (layer, machine) => {
    const model = getModelFromType(layer.type)
    return model.usesMachine ? machine : null
  },
)((state, id) => id)

// creates a selector that returns shape vertices for a given layer
export const getLayerVertices = createCachedSelector(
  getLayer,
  getLayerMachine,
  (layer, machine) => {
    const state = {
      shape: layer,
      machine,
    }
    log("getLayerVertices", layer.id)
    const layerInstance = new Layer(layer.type)

    // TODO: fix this; move cache into model? Should be caching vertices only, not transforms
    if (layerInstance.model.shouldCache) {
      const key = getCacheKey(state)
      let vertices = cache.get(key)

      if (!vertices) {
        vertices = layerInstance.getVertices(state)

        if (vertices.length > 1) {
          cache.set(key, vertices)
          log(
            `caching shape - ${cache.length} vertices / ${cache.itemCount} items`,
          )
        }
      }

      return vertices
    } else {
      if (!state.shape.dragging && state.shape.effect) {
        return []
      } else {
        return layer.getVertices(state)
      }
    }
  },
)((state, id) => id)

// creates a selector that returns transformed vertices for a given layer
const getTransformedVertices = createCachedSelector(
  getLayerVertices,
  getLayer,
  getLayerEffects,
  (vertices, layer, effects) => {
    log("getTransformedVertices", layer.id)
    return transformShapes(vertices, layer, effects)
  },
)((state, id) => id)

// transform a given list of vertices as needed to be displayed in a preview layer
const previewTransform = (layer, vertices) => {
  return vertices.map((vertex) => {
    // store original coordinates before transforming
    let previewVertex = rotate(
      offset(vertex, -layer.x, -layer.y),
      layer.rotation,
    )

    previewVertex.origX = vertex.x
    previewVertex.origY = vertex.y

    return previewVertex
  })
}

// creates a selector that returns computed (machine-bound) vertices for a given layer
const getComputedVertices = createCachedSelector(
  (state, id) => id,
  getTransformedVertices,
  getNonEffectLayerIndex,
  getNumVisibleLayers,
  getMachineState,
  (id, vertices, layerIndex, numLayers, machine) => {
    log("getComputedVertices", id)
    return polishVertices(vertices, machine, {
      start: layerIndex === 0,
      end: layerIndex === numLayers - 1,
    })
  },
)((state, id) => id)

// creates a selector that returns previewable vertices for a given layer
export const getPreviewVertices = createCachedSelector(
  getTransformedVertices,
  getComputedVertices,
  getLayer,
  (transformedVertices, computedVertices, layer, foo, bar) => {
    log("getPreviewVertices", layer.id)
    const vertices = layer.dragging ? transformedVertices : computedVertices
    return previewTransform(layer, vertices)
  },
)((state, id) => id)

// returns a flattened array of all visible computed vertices and connectors (across layers)
export const getAllComputedVertices = createSelector(getState, (state) => {
  if (!state.fonts.loaded) {
    return []
  } // wait for fonts

  log("getAllComputedVertices")
  const visibleLayerIds = getVisibleNonEffectIds(state)

  return visibleLayerIds
    .map((id, idx) => {
      const vertices = getComputedVertices(state, id)
      const connector = getConnectingVertices(state, id)
      return [...vertices, ...connector]
    })
    .flat()
})

// returns an array of vertices connecting a given layer to the next (if it exists)
export const getConnectingVertices = createCachedSelector(
  (state, id) => id,
  getState,
  (layerId, state) => {
    log("getConnectingVertices")
    const visibleLayerIds = getVisibleNonEffectIds(state)
    const idx = getNonEffectLayerIndex(state, layerId)

    if (idx > visibleLayerIds.length - 2) {
      return []
    }

    const endId = visibleLayerIds[idx + 1]
    const startLayer = getLayer(state, layerId) //|| getCurrentLayer(state)
    const endLayer = getLayer(state, endId) //|| getCurrentLayer(state)
    const startVertices = getLayerVertices(state, startLayer.id)
    const endVertices = getLayerVertices(state, endLayer.id)
    const start = startVertices[startVertices.length - 1]
    const end = endVertices[0]

    if (startLayer.connectionMethod === "along perimeter") {
      const machineInstance = getMachineInstance([], state.main.machine)
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
export const getVertexOffsets = createSelector([getState], (state) => {
  log("getVertexOffsets")
  const visibleLayerIds = getVisibleNonEffectIds(state)
  let offsets = {}
  let offset = 0

  visibleLayerIds.forEach((id) => {
    const vertices = getComputedVertices(state, id)
    const connector = getConnectingVertices(state, id)
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
export const getVerticesStats = createSelector(
  getAllComputedVertices,
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
export const getSliderBounds = createSelector(
  [getAllComputedVertices, getPreviewState],
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
export const getSliderColors = createSelector(
  [getSliderBounds, getVertexOffsets],
  (bounds, offsets) => {
    log("getSliderColors")
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
