import { createSelector } from 'reselect'

const getLayers = state => state.layers
const getCurrentLayerId = state => state.layers.current

export const getCurrentLayer = createSelector(
  [ getCurrentLayerId, getLayers ],
  (id, layers) => layers.byId[id]
)
