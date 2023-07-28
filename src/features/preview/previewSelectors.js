import { createSelector } from "reselect"
import { getMainState } from "@/features/app/appSelectors"

export const getPreviewState = createSelector(
  getMainState,
  (main) => main.preview,
)
