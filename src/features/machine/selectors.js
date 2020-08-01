import LRUCache from 'lru-cache'
import { createSelector } from 'reselect'
import Victor from 'victor'
import Color from 'color'
import {
  transformShapes,
  transformShape,
  polishVertices,
  scaleImportedVertices
} from './computer'
import { getShape } from '../../models/shapes'
import { makeGetLayer, makeGetLayerIndex, getNumVisibleLayers, getVisibleLayerIds } from '../layers/selectors'
import { rotate, offset, getSliderBounds } from '../../common/geometry'

const cache = new LRUCache({
  length: (n, key) => { return n.length },
  max: 500000
})

const getCacheKey = (state) => {
  return JSON.stringify(state)
}

const getState = state => state
const getCurrentLayer = state => state.layers.byId[state.layers.current]
const getLayers = state => state.layers
const getImporter = state => state.importer
const getMachine = state => state.machine
const getPreview = state => state.preview

// the make selector functions below are patterned after the comment here:
// https://github.com/reduxjs/reselect/issues/74#issuecomment-472442728
const cachedSelectors = {}

// by returning null for shapes which can change size, this selector will ensure
// transformed vertices are not redrawn when machine settings change
const makeGetLayerMachine = layerId => {
  return createSelector(
    [ getLayers, getMachine ],
    (layers, machine) => {
      const layer = layers.byId[layerId]
      return layer.canChangeSize ? null : machine
    }
  )
}

// creates a selector that returns shape vertices for a given layer
const makeGetLayerVertices = layerId => {
  return createSelector(
    [ getCachedSelector(makeGetLayer, layerId), getCachedSelector(makeGetLayerMachine, layerId) ],
    (layer, machine) => {
      const state = {
        shape: layer,
        machine: machine
      }
      const metashape = getShape(layer)
      if (layer.shouldCache) {
        const key = getCacheKey(state)
        let vertices = cache.get(key)

        if (!vertices) {
          vertices = metashape.getVertices(state)
          cache.set(key, vertices)
          // for debugging purposes
          // console.log('caching shape...' + cache.length + ' ' + cache.itemCount)
        }

        return vertices
      } else {
        return metashape.getVertices(state)
      }
    }
  )
}

// creates a selector that returns transformed vertices for a given layer
const makeGetTransformedVertices = layerId => {
  return createSelector(
    [
      getCachedSelector(makeGetLayerVertices, layerId),
      getCachedSelector(makeGetLayer, layerId)
    ],
    (vertices, layer) => {
      return transformShapes(vertices, layer)
    }
  )
}

// creates a selector that returns computed (machine-bound) vertices for a given layer
const makeGetComputedVertices = layerId => {
  return createSelector(
    [
      getCachedSelector(makeGetTransformedVertices, layerId),
      getMachine
    ],
    (vertices, machine) => {
      return polishVertices(vertices, machine)
    }
  )
}

// creates a selector that returns previewable vertices for a given layer
export const makeGetPreviewVertices = layerId => {
  return createSelector(
    [
        getLayers,
        getVisibleLayerIds,
        getMachine,
    ],
    (layers, visibleLayerIds, machine) => {
      const state = {
        layers: layers,
        machine: machine
      }

      let vertices
      const layer = layers.byId[layerId]
      const index = getCachedSelector(makeGetLayerIndex, layerId)(state)
      const numLayers = getNumVisibleLayers(state)

      if (layer.dragging) {
        vertices = getCachedSelector(makeGetTransformedVertices, layerId)(state)
      } else {
        vertices = getCachedSelector(makeGetComputedVertices, layerId)(state)
        if (index < numLayers - 1) {
          const nextLayerId = visibleLayerIds[index + 1]
          const nextLayer = layers.byId[nextLayerId]

          if (!nextLayer.dragging && nextLayer.visible) {
            // draw the stitch between the two layers
            const nextVertices = getCachedSelector(makeGetComputedVertices, nextLayerId)(state)
            vertices = vertices.concat(nextVertices[0])
          }
        }
      }

      const konvaScale = 5 // our transformer is 5 times bigger than the actual starting shape
      const konvaDelta = (konvaScale - 1)/2 * layer.startingSize

      return vertices.map(vertex => {
        return offset(rotate(offset(vertex, -layer.offsetX, -layer.offsetY), layer.rotation), konvaDelta, -konvaDelta)
      })
    }
  )
}

// ensures we only create a single selector for a given layer
export const getCachedSelector = (fn, layerId) => {
  if (!cachedSelectors[fn.name]) {
    cachedSelectors[fn.name] = {}
  }

  if (!cachedSelectors[fn.name][layerId]) {
    cachedSelectors[fn.name][layerId] = fn(layerId)
  }

  return cachedSelectors[fn.name][layerId]
}

// returns a flattened list of all visible computed vertices (across layers)
export const getAllComputedVertices = createSelector(
  [getState, getVisibleLayerIds],
  (state, visibleLayerIds) => {
    return visibleLayerIds.map(id => getCachedSelector(makeGetComputedVertices, id)(state)).flat()
  }
)

// returns a flattened list of all visible preview vertices (across layers)
export const getAllPreviewVertices = createSelector(
  [getState, getVisibleLayerIds],
  (state, visibleLayerIds) => {
    return visibleLayerIds.map(id => getCachedSelector(makeGetPreviewVertices, id)(state)).flat()
  }
)

// returns the starting offset for each layer, given previous layers
export const getVertexOffsets = createSelector(
  [getState, getVisibleLayerIds],
  (state, visibleLayerIds) => {
    let offsets = {}
    let offset = 0
    visibleLayerIds.forEach((id) => {
      const vertices = getCachedSelector(makeGetComputedVertices, id)(state)

      offsets[id] = offset
      offset += vertices.length + 1
    })
    return offsets
  }
)

// statistics across all layers
export const getVerticesStats = createSelector(
  getAllComputedVertices,
  (vertices) => {
    let distance = 0.0
    let previous = null

    vertices.forEach((vertex) => {
      if (previous) {
        distance += Math.sqrt(Math.pow(vertex.x - previous.x, 2.0) +
                              Math.pow(vertex.y - previous.y, 2.0))
      }
      previous = vertex
    })

    return {
      numPoints: vertices.length,
      distance: Math.floor(distance)
    }
  }
)

export const getSliderColors = createSelector(
  [getAllPreviewVertices, getPreview],
  (vertices, preview) => {
    const sliderValue = preview.sliderValue
    const colors = {}

    if (sliderValue !== 0) {
      let { start, end } = getSliderBounds(vertices, sliderValue)
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
export const getPreviewTrackVertices = createSelector(
  getCurrentLayer,
  (layer) => {
    const numLoops = layer.numLoops
    const konvaScale = 5 // our transformer is 5 times bigger than the actual starting shape
    const konvaDelta = (konvaScale - 1)/2 * layer.startingSize
    let trackVertices = []

    for (var i=0; i<numLoops; i++) {
      if (layer.trackEnabled) {
        trackVertices.push(transformShape(layer, new Victor(0.0, 0.0), i, i))
      }
    }

    return trackVertices.map(vertex => {
      return offset(rotate(offset(vertex, -layer.offsetX, -layer.offsetY), layer.rotation), konvaDelta, -konvaDelta)
    })
  }
)

// OLD: DELETE ONCE IMPORT IS A LAYER

// requires importer and machine state
export const getImportedVertices = createSelector(
  [
    getImporter,
    getMachine
  ],
  (importer, machine) => {
    let vertices = scaleImportedVertices(importer, machine)
    return polishVertices(vertices, machine)
  }
)
