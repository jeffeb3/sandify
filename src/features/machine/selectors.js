import { createSelector } from 'reselect'
import {
  transformShapes,
  patternImport
} from './computer'

const getApp = state => state.app
const getShapes = state => state.shapes
const getTransforms = state => state.transforms
const getImporter = state => state.importer
const getExporter = state => state.exporter
const getMachine = state => state.machine

export const getVertices = createSelector(
  [
      getApp,
      getShapes,
      getTransforms,
      getImporter,
      getExporter,
      getMachine,
  ],
  (app, shapes, transforms, importer, exporter, machine) => {
    let state = {
      app: app,
      shapes: shapes,
      shape: shapes.byId[shapes.currentId],
      transforms: transforms,
      transform: transforms.byId[shapes.currentId],
      importer: importer,
      exporter: exporter,
      machine: machine
    }

    if (state.app.input === 'shapes') {
      return transformShapes(state)
    } else if (state.app.input === 'code') {
      return patternImport(state)
    } else {
      if (state.importer.fileName) {
        return patternImport(state)
      } else {
        return transformShapes(state)
      }
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
