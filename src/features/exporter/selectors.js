import { createSelector } from "reselect"
import { getAllLayers } from "../../features/layers/selectors"
import CommentExporter from "./CommentExporter"
import { log } from "../../common/debugging"
import {
  getAppState,
  getExporterState,
  getMachineState,
} from "../store/selectors"

export const getComments = createSelector(
  [getAppState, getAllLayers, getExporterState, getMachineState],
  (app, layers, exporter, machine) => {
    log("getComments")
    const state = {
      app,
      layers,
      exporter,
      machine,
    }

    return new CommentExporter(state).export()
  },
)
