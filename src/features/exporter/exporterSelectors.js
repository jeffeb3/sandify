import { createSelector } from "reselect"
import { getAllLayers } from "@/features/layers/layerSelectors"
import CommentExporter from "./CommentExporter"
import { log } from "@/common/debugging"
import { getAppState, getMainState } from "@/features/app/appSelectors"
import { getMachineState } from "@/features/machine/machineSelectors"

export const getExporterState = createSelector(
  getMainState,
  (main) => main.exporter,
)

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
