import { createSelector } from 'reselect'
import { getAllLayersInfo } from '../../features/layers/selectors'
import CommentExporter from './CommentExporter'

const getApp = state => state.app
const getExporter = state => state.exporter
const getMachine = state => state.machine

export const getComments = createSelector(
  [
      getApp,
      getAllLayersInfo,
      getExporter,
      getMachine,
  ],
  (app, layers, exporter, machine) => {
    const state = {
      app: app,
      layers: layers,
      exporter: exporter,
      machine: machine
    }

    return new CommentExporter(state).export()
  }
)
