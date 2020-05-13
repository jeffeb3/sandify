import { createSelector } from 'reselect'
import CommentExporter from './CommentExporter'

const getApp = state => state.app
const getShapes = state => state.shapes
const getCurrentShape = state => state.shapes.byId[state.shapes.currentId]
const getImporter = state => state.importer
const getExporter = state => state.exporter
const getMachine = state => state.machine

export const getComments = createSelector(
  [
      getApp,
      getShapes,
      getCurrentShape,
      getImporter,
      getExporter,
      getMachine,
  ],
  (app, shapes, shape, importer, exporter, machine) => {
    const state = {
      app: app,
      shapes: shapes,
      shape: shape,
      importer: importer,
      exporter: exporter,
      machine: machine
    }

    return new CommentExporter(state).export()
  }
)
