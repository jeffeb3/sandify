import { createSelector } from 'reselect'
import { getAllLayersStates } from '../../features/layers/layersSlice'
import CommentExporter from './CommentExporter'
import { log } from '../../common/util'
import { getApp, getExporter, getMachine } from '../store/selectors'

export const getComments = createSelector(
  [
      getApp,
      getAllLayersStates,
      getExporter,
      getMachine,
  ],
  (app, layers, exporter, machine) => {
    log("getComments")
    const state = {
      app: app,
      layers: layers,
      exporter: exporter,
      machine: machine
    }

    return new CommentExporter(state).export()
  }
)
