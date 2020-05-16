import { createSlice } from '@reduxjs/toolkit'
import uniqueId from 'lodash/uniqueId'
import { getShape } from '../../models/shapes'

const protectedAttrs = ['repeatEnabled', 'canTransform', 'selectGroup', 'canChangeSize', 'shouldCache']

const layersSlice = createSlice({
  name: 'layer',
  initialState: {
    current: null,
    selected: null,
    byId: {},
    allIds: []
  },
  reducers: {
    addLayer(state, action) {
      let layer = { ...action.payload }
      layer.id = uniqueId('layer')
      layer.name = layer.name || layer.type || layer.id
      state.byId[layer.id] = layer
      state.allIds.push(layer.id)
    },
    restoreDefaults(state, action) {
      const id = action.payload
      const layer = state.byId[id]
      const defaults = getShape(layer).getInitialState()

      state.byId[layer.id] = {
        id: layer.id,
        ...defaults
      }
    },
    setCurrentLayer(state, action) {
      // expects payload to contain an index, not an id
      const current = state.byId[state.allIds[action.payload]]
      state.current = current.id
      state.selected = current.id
    },
    setShapeType(state, action) {
      const changes = action.payload
      const defaults = getShape(changes).getInitialState()
      const layer = state.byId[changes.id]

      layer.type = changes.type
      Object.keys(defaults).forEach(attr => {
        if (layer[attr] === undefined) {
          layer[attr] = defaults[attr]
        }
      })

      protectedAttrs.forEach(attr => {
        layer[attr] = defaults[attr]
      })

      state.byId[layer.id] = layer
    },
    updateLayer(state, action) {
      const layer = action.payload
      state.byId[layer.id] = {...state.byId[layer.id], ...layer}
    },
    toggleRepeat(state, action) {
      const transform = action.payload
      state.byId[transform.id].repeatEnabled = !state.byId[transform.id].repeatEnabled
    },
    toggleGrow(state, action) {
      const transform = action.payload
      state.byId[transform.id].growEnabled = !state.byId[transform.id].growEnabled
    },
    toggleSpin(state, action) {
      const transform = action.payload
      state.byId[transform.id].spinEnabled = !state.byId[transform.id].spinEnabled
    },
    toggleTrack(state, action) {
      const transform = action.payload
      state.byId[transform.id].trackEnabled = !state.byId[transform.id].trackEnabled
    },
    toggleTrackGrow(state, action) {
      const transform = action.payload
      state.byId[transform.id].trackGrowEnabled = !state.byId[transform.id].trackGrowEnabled
    },
  }
})

export const {
  addLayer,
  restoreDefaults,
  setCurrentLayer,
  setShapeType,
  updateLayer,
  toggleRepeat,
  toggleSpin,
  toggleGrow,
  toggleTrack,
  toggleTrackGrow,
} = layersSlice.actions

export default layersSlice.reducer
