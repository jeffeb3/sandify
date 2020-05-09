import LRUCache from 'lru-cache'
import { createSelector } from 'reselect'
import {
  transformShapes,
  transformShape,
  polishVertices,
  scaleImportedVertices
} from './computer'
import { getShape } from '../shapes/selectors'

const cache = new LRUCache({
  length: (n, key) => { return n.length },
  max: 500000
})

const getCacheKey = (state) => {
  return JSON.stringify(state)
}

const getApp = state => state.app
const getShapes = state => state.shapes
const getTransforms = state => state.transforms
const getCurrentShape = state => state.shapes.byId[state.shapes.currentId]
const getTransform = state => state.transforms.byId[state.shapes.currentId]
const getImporter = state => state.importer
const getMachine = state => state.machine
const getDragging = state => state.preview.dragging

// by returning null for shapes which can change size, this selector will ensure
// transformed vertices are not redrawn when machine settings change
const getTransformMachine = state => getTransform(state).canChangeSize ? null : state.machine

// requires only shape, and in the case of erasers, machine state
export const getShapedVertices = createSelector(
  [
      getCurrentShape,
      getTransformMachine
  ],
  (shape, machine) => {
    const state = {
      shape: shape,
      machine: machine
    }
    const metashape = getShape(shape)
    if (shape.shouldCache) {
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
      getTransform
  ],
  (vertices, transform) => {
    return transformShapes(vertices, transform)
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
      getShapes,
      getTransforms,
      getImporter,
      getMachine,
      getDragging
  ],
  (app, shapes, transforms, importer, machine, dragging) => {
    const state = {
      app: app,
      shapes: shapes,
      transforms: transforms,
      importer: importer,
      machine: machine,
      dragging: dragging
    }

    const hasImported = (state.app.input === 'code' || state.importer.fileName)
    if (state.app.input === 'shapes' || !hasImported) {
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

export const getTrackVertices = createSelector(
  [
    getTransform
  ],
  (transform) => {
    const numLoops = transform.numLoops
    var trackVertices = []

    for (var i=0; i<numLoops; i++) {
      if (transform.trackEnabled) {
        trackVertices.push(transformShape(transform, {x: 0.0, y: 0.0}, i, i))
      }
    }

    return trackVertices
  }
)
