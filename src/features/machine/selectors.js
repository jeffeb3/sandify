import LRUCache from 'lru-cache'
import { createSelector } from 'reselect'
import Victor from 'victor'
import {
  transformShapes,
  transformShape,
  polishVertices,
  scaleImportedVertices
} from './computer'
import { getShape } from '../../models/shapes'
import { makeGetLayer, makeGetLayerIndex, getNumLayers } from '../layers/selectors'
import { rotate, offset } from '../../common/geometry'

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
const cachedSelectors = {}

// the make selector functions below are patterned after the comment here:
// https://github.com/reduxjs/reselect/issues/74#issuecomment-472442728

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
        getMachine
    ],
    (layers, machine) => {
      const state = {
        layers: layers,
        machine: machine
      }

      let vertices
      const layer = layers.byId[layerId]
      const index = getCachedSelector(makeGetLayerIndex, layerId)(state)
      const numLayers = getNumLayers(state)

      if (layer.dragging) {
        vertices = getCachedSelector(makeGetTransformedVertices, layerId)(state)
      } else {
        vertices = getCachedSelector(makeGetComputedVertices, layerId)(state)
        const nextLayerId = layers.allIds[index + 1]
        const nextLayer = layers.byId[nextLayerId]

        if (index < numLayers - 1) {
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

// returns a flattened list of all vertices (across layers)
export const getAllComputedVertices = createSelector(
  getState,
  (state) => {
    return state.layers.allIds.map(id => getCachedSelector(makeGetComputedVertices, id)(state)).flat()
  }
)

// statistics across all layers
export const getVerticesStats = createSelector(
  getAllComputedVertices,
  (vertices) => {
    let distance = 0.0
    let previous = null

    vertices.forEach( (vertex) => {
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

export const getVertexColors = createSelector(
  [getAllComputedVertices, getPreview],
  (vertices, preview) => {
    const slide_size = 10.0
    const sliderValue = preview.sliderValue
    const colors = {}

    if (sliderValue === 0) {
      colors[vertices[0]] = 'yellow'
    } else {
      // Let's start by just assuming we want a slide_size sized window, as a percentage
      // of the whole thing.
      const beginFraction = sliderValue / 100.0
      const endFraction = (slide_size + sliderValue) / 100.0
      let beginVertex = Math.round(vertices.length * beginFraction)
      let endVertex = Math.round(vertices.length * endFraction)
    }

    return colors
  }
)

// used by the preview window; reverses rotation and offsets because they are
// re-added by Konva transformer.
export const getPreviewTrackVertices = createSelector(
  [
    getCurrentLayer
  ],
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
