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
import { makeGetLayer } from '../layers/selectors'
import { rotate, offset } from '../../common/geometry'

const cache = new LRUCache({
  length: (n, key) => { return n.length },
  max: 500000
})

const getCacheKey = (state) => {
  return JSON.stringify(state)
}

const getApp = state => state.app
const getCurrentLayer = state => state.layers.byId[state.layers.current]
const getLayers = state => state.layers
const getImporter = state => state.importer
const getMachine = state => state.machine
const getDragging = state => state.preview.dragging
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
        getMachine,
        getDragging
    ],
    (layers, machine, dragging) => {
      const state = {
        layers: layers,
        machine: machine,
        dragging: dragging
      }

      let vertices
      if (dragging) {
        vertices = getCachedSelector(makeGetTransformedVertices, layerId)(state)
      } else {
        vertices = getCachedSelector(makeGetComputedVertices, layerId)(state)
      }

      const layer = layers.byId[layerId]
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
const getState = state => state
export const getAllComputedVertices = createSelector(
  getState,
  (state) => {
    return state.layers.allIds.map(id => getCachedSelector(makeGetComputedVertices, id)(state)).flat()
  }
)

// OLD: DELETE ONCE IMPORT IS A LAYER

// by returning null for shapes which can change size, this selector will ensure
// transformed vertices are not redrawn when machine settings change
const getLayerMachine = state => getCurrentLayer(state).canChangeSize ? null : state.machine

// requires only shape, and in the case of erasers, machine state
export const getShapedVertices = createSelector(
  [
      getCurrentLayer,
      getLayerMachine
  ],
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

// requires shape and transform state
export const getTransformedVertices = createSelector(
  [
      getShapedVertices,
      getCurrentLayer
  ],
  (vertices, layer) => {
    return transformShapes(vertices, layer)
  }
)

// requires shape, transform, and machine state
export const getComputedVertices = createSelector(
  [
      getTransformedVertices,
      getMachine
  ],
  (vertices, machine) => {
    return polishVertices(vertices, machine)
  }
)

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

// top-level vertex selector; makes use of Russian-doll cached selectors that are
// only recalculated when their required states change.
export const getVertices = createSelector(
  [
      getApp,
      getLayers,
      getImporter,
      getMachine,
      getDragging
  ],
  (app, layers, importer, machine, dragging) => {
    const state = {
      app: app,
      layers: layers,
      importer: importer,
      machine: machine,
      dragging: dragging
    }

    const hasImported = (state.app.input === 'code' || state.importer.fileName)
    if (state.app.input === 'shape' || !hasImported) {
      if (dragging) {
        return getTransformedVertices(state)
      } else {
        return getComputedVertices(state)
      }
    } else {
      return getImportedVertices(state)
    }
  }
)

export const getVerticesStats = createSelector(
  [
      getVertices
  ],
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
