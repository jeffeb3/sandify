import LRUCache from 'lru-cache'
import { createSelector } from 'reselect'
import Color from 'color'
import { transformShapes, polishVertices, getMachineInstance } from './computer'
import { morphVertices } from '../../models/Morph'
import { getModelFromShape } from '../../config/models'
import { getEffectModel } from '../../config/effects'
import { getMachine, getState, getPreview } from '../store/selectors'
import { getLoadedFonts } from '../fonts/selectors'
import { makeGetLayer, getNumVisibleLayers, makeGetEffects, makeGetNonEffectLayerIndex } from '../layers/selectors'
import { makeGetShapeAttrs, getCurrentLayerEffectIdsInOrder, makeGetLayerEffectStatesInOrder, getVisibleLayerIdsInOrder } from '../layers/layersSlice'
import { getCachedSelector } from '../store/selectors'
import { rotate, offset } from '../../common/geometry'
import { log } from '../../common/util'

const cache = new LRUCache({
  length: (n, key) => { return n.length },
  max: 500000
})

const getCacheKey = (state) => {
  return JSON.stringify(state)
}

// by returning null for shapes which don't use machine settings, this selector will ensure
// transformed vertices are not redrawn when machine settings change
const makeGetLayerMachine = layerId => {
  return createSelector(
    [
      getCachedSelector(makeGetShapeAttrs, layerId),
      getMachine
    ],
    (shapeAttrs, machine) => {
      log('makeGetLayerMachine', layerId)
      return shapeAttrs.usesMachine ? machine : null
    }
  )
}

// by returning null for shapes which don't use fonts, this selector will ensure
// transformed vertices are not redrawn when fonts are loaded
const makeGetLayerFonts = layerId => {
  return createSelector(
    [
      getCachedSelector(makeGetShapeAttrs, layerId),
      getLoadedFonts
    ],
    (shapeAttrs, fonts) => {
      log('makeGetLayerFonts', layerId)
      return shapeAttrs.usesFonts ? fonts : null
    }
  )
}

// creates a selector that returns shape vertices for a given layer
const makeGetShapeVertices = layerId => {
  return createSelector(
    [
      getCachedSelector(makeGetLayer, layerId), // This should be smaller, just the shape
      getCachedSelector(makeGetLayerMachine, layerId),
      getCachedSelector(makeGetLayerFonts, layerId),
    ],
    (layer, machine, fonts) => {
      const state = {
        shape: layer.shape,
        machine: machine,
        fonts: fonts
      }
      log('makeGetShapeVertices', layerId)
      const shapeModel = getModelFromShape(state.shape)

      const key = getCacheKey(state)
      let vertices = cache.get(key)

      if (!vertices) {
        vertices = shapeModel.getVertices(state)
        log("uncached vertices")

        if (vertices.length > 1) {
          cache.set(key, vertices)
          log('caching shape', cache.length + ' ' + cache.itemCount)
        }
      }

      return vertices
    }
  )
}

// creates a selector that returns vertices for a given layer, including shapes and effects.
const makeGetLayerVertices = layerId => {
  return createSelector(
    [
      getCachedSelector(makeGetShapeVertices, layerId),
      getCachedSelector(makeGetShapeAttrs, layerId),
      getCachedSelector(makeGetLayer, layerId),
      getCachedSelector(makeGetLayerEffectStatesInOrder, layerId),
    ],
    (shapeVertices, shapeAttrs, layer, effectStates) => {
      // TODO fix caching of effects, it probably saves a lot more than time shape caches, but is
      // invalidated a lot more often too.
      // We can also create an incremental state/cacheKey by adding the state from each effect that
      // has been computed.
      log('makeGetLayerVertices', layerId)

      let vertices = shapeVertices.slice()
      for (const effectState of effectStates) {
        const effectModel = getEffectModel(effectState)
        vertices = effectModel.applyEffect(effectState, layer, vertices)
      }

      // This looks funny, but we want the case of 'undefined' to be the same as true
      if (shapeAttrs.canMorph !== false) {
        vertices = morphVertices(layer,vertices)
      }
      return vertices
    }
  )
}

// creates a selector that returns transformed vertices for a given layer
const makeGetTransformedVertices = layerId => {
  return createSelector(
    [
      getCachedSelector(makeGetLayerVertices, layerId),
      getCachedSelector(makeGetLayer, layerId),
      getCachedSelector(makeGetEffects, layerId)
    ],
    (vertices, layer, effects, fonts) => {
      log('makeGetTransformedVertices', layerId)
      return transformShapes(vertices, layer, effects)
    }
  )
}

export const makeGetConnectorVertices = (startId, endId) => {
  return createSelector(
    [
      getCachedSelector(makeGetLayer, startId),
      getCachedSelector(makeGetComputedVertices, startId),
      getCachedSelector(makeGetComputedVertices, endId),
      getMachine
    ],
    (startLayer, startVertices, endVertices, machine) => {
      log('makeGetConnectorVertices', startId + '-' + endId)
      const start = startVertices[startVertices.length - 1]
      const end = endVertices[0]

      if (startLayer.connectionMethod === 'along perimeter') {
        const machineInstance = getMachineInstance([], machine)
        const startPerimeter = machineInstance.nearestPerimeterVertex(start)
        const endPerimeter = machineInstance.nearestPerimeterVertex(end)
        const perimeterConnection = machineInstance.tracePerimeter(startPerimeter, endPerimeter)

        return [start, startPerimeter, perimeterConnection, endPerimeter, end].flat()
      } else {
        return [start, end]
      }
    }
  )
}

// transform a given list of vertices as needed to be displayed in a preview layer
const previewTransform = (layer, vertices) => {
  const konvaScale = layer.autosize ? 5 : 1 // our transformer is 5 times bigger than the actual starting shape
  const konvaDeltaX = (konvaScale - 1)/2 * layer.startingWidth
  const konvaDeltaY = (konvaScale - 1)/2 * layer.startingHeight

  return vertices.map(vertex => {
    // store original coordinates before transforming
    let previewVertex = offset(rotate(offset(vertex, -layer.offsetX, -layer.offsetY), layer.rotation), konvaDeltaX, -konvaDeltaY)
    previewVertex.origX = vertex.x
    previewVertex.origY = vertex.y
    return previewVertex
  })
}

// creates a selector that returns computed (machine-bound) vertices for a given layer
const makeGetComputedVertices = layerId => {
  return createSelector(
    [
      getCachedSelector(makeGetTransformedVertices, layerId),
      getCachedSelector(makeGetNonEffectLayerIndex, layerId),
      getNumVisibleLayers,
      getMachine
    ],
    (vertices, layerIndex, numLayers, machine) => {
      log('makeGetComputedVertices', layerId)
      return polishVertices(vertices, machine, {
        start: layerIndex === 0,
        end: layerIndex === numLayers - 1
      })
    }
  )
}

// creates a selector that returns previewable vertices for a given layer
export const makeGetPreviewVertices = layerId => {
  return createSelector(
    [
        getCachedSelector(makeGetTransformedVertices, layerId),
        getCachedSelector(makeGetComputedVertices, layerId),
        getCachedSelector(makeGetLayer, layerId)
    ],
    (transformedVertices, computedVertices, layer) => {
      log('makeGetPreviewVertices', layerId)
      const vertices = layer.dragging ? transformedVertices : computedVertices
      return previewTransform(layer, vertices)
    }
  )
}

// returns a flattened array of all visible computed vertices and connectors (across layers)
export const getAllComputedVertices = createSelector(
  [getState, getVisibleLayerIdsInOrder],
  (state, visibleLayerIds) => {
    log("getAllComputedVertices")
    return visibleLayerIds.map((id, idx) => {
      const connector = getConnectingVertices(state, id)
      let vertices = getCachedSelector(makeGetComputedVertices, id)(state)
      if (connector) vertices = [...vertices, ...connector]
      return vertices
    }).flat()
  }
)

// returns an array of vertices connecting a given layer to the next (if it exists)
export const getConnectingVertices = (state, layerId) => {
  const visibleLayerIds = getVisibleLayerIdsInOrder(state)
  const idx = getCachedSelector(makeGetNonEffectLayerIndex, layerId)(state)

  return idx < visibleLayerIds.length - 1 ?
    getCachedSelector(makeGetConnectorVertices, layerId, visibleLayerIds[idx + 1])(state) :
    null
}

// returns the starting offset for each layer, given previous layers
export const getVertexOffsets = createSelector(
  [getState, getVisibleLayerIdsInOrder],
  (state, visibleLayerIds) => {
    log('getVertexOffsets')
    let offsets = {}
    let offset = 0

    visibleLayerIds.forEach((id) => {
      const vertices = getCachedSelector(makeGetComputedVertices, id)(state)
      const connector = getConnectingVertices(state, id) || []
      offsets[id] = { start: offset, end: offset + vertices.length - 1}

      if (connector.length > 0) {
        offsets[id + '-connector'] = { start: offset + vertices.length, end: offset + vertices.length + connector.length - 1}
        offset += vertices.length + connector.length
      }
    })

    return offsets
  }
)

// returns statistics across all layers
export const getVerticesStats = createSelector(
  getAllComputedVertices,
  (vertices) => {
    let distance = 0.0
    let previous = null

    vertices.forEach((vertex) => {
      if (previous && vertex) {
        distance += Math.sqrt(Math.pow(vertex.x - previous.x, 2.0) +
                              Math.pow(vertex.y - previous.y, 2.0))
      }
      previous = vertex
    })

    log("getVerticeStats")
    return {
      numPoints: vertices.length,
      distance: Math.floor(distance)
    }
  }
)

// given a set of vertices and a slider value, returns the indices of the
// start and end vertices representing a preview slider moving through them.
export const getSliderBounds = createSelector(
  [
    getAllComputedVertices,
    getPreview
  ],
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

    return { start: start, end: end }
})

// returns a hash of { index => color } that specifies the gradient color of the
// line drawn at each index.
export const getSliderColors = createSelector(
  [
    getSliderBounds,
    getVertexOffsets
  ],
  (bounds, offsets) => {
    log("getSliderColors")
    const colors = {}
    const { start, end } = bounds

    if (end !== start) {
      let startColor = Color('yellow')
      const colorStep = 3.0 / 8 / (end - start)

      for(let i=end; i>=start; i--) {
        colors[i] = startColor.darken(colorStep * (end-i)).hex()
      }
    }

    return colors
  }
)

// used by the preview window; reverses rotation and offsets because they are
// re-added by Konva transformer.
export const makeGetPreviewTrackVertices = layerId => {
  return createSelector(
    getCachedSelector(makeGetLayer, layerId),
    (layer) => {
      log('makeGetPreviewTrackVertices', layerId)
//      const numLoops = layer.numLoops
      const konvaScale = layer.autosize ? 5 : 1 // our transformer is 5 times bigger than the actual starting shape
      const konvaDeltaX = (konvaScale - 1)/2 * layer.startingWidth
      const konvaDeltaY = (konvaScale - 1)/2 * layer.startingHeight
      let trackVertices = []

// TODO: re-implement display of track vertices
//      for (var i=0; i<numLoops; i++) {
//        if (layer.trackEnabled) {
//          trackVertices.push(transformShape(layer, new Victor(0.0, 0.0), i, i))
//        }
//      }

      return trackVertices.map(vertex => {
        return offset(rotate(offset(vertex, -layer.offsetX, -layer.offsetY), layer.rotation), konvaDeltaX, -konvaDeltaY)
      })
    }
  )
}
