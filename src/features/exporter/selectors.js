import { createSelector } from 'reselect'
import CommentExporter from './CommentExporter'

const getApp = state => state.app
const getShapes = state => state.shapes
const getTransforms = state => state.transforms
const getImporter = state => state.importer
const getExporter = state => state.exporter
const getMachine = state => state.machine

export const getComments = createSelector(
  [
      getApp,
      getShapes,
      getTransforms,
      getImporter,
      getExporter,
      getMachine,
  ],
  (app, shapes, transforms, importer, exporter, machine) => {
    const state = {
      app: app,
      shapes: shapes,
      shape: shapes.byId[shapes.currentId],
      transforms: transforms,
      transform: transforms.byId[shapes.currentId],
      importer: importer,
      exporter: exporter,
      machine: machine
    }

    const commentChar = state.exporter.fileType === 'GCode (.gcode)' ? ';' : '#'
    return new CommentExporter(state, commentChar).export()
  }
)
