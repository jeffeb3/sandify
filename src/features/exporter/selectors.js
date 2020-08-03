import { createSelector } from 'reselect'
import CommentExporter from './CommentExporter'

const getApp = state => state.app
const getLayers = state => state.layers
const getCurrentLayer = state => state.layers.byId[state.layers.current]
const getImporter = state => state.importer
const getExporter = state => state.exporter
const getMachine = state => state.machine

export const getComments = createSelector(
  [
      getApp,
      getLayers,
      getCurrentLayer,
      getImporter,
      getExporter,
      getMachine,
  ],
  (app, layers, layer, importer, exporter, machine) => {
    const state = {
      app: app,
      layers: layers,
      layer: layer,
      importer: importer,
      exporter: exporter,
      machine: machine
    }

    return new CommentExporter(state).export()
  }
)
