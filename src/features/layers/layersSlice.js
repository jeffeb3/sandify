import { createSlice } from '@reduxjs/toolkit'
import uniqueId from 'lodash/uniqueId'
import arrayMove from 'array-move'
import { getShape } from '../../models/shapes'

const protectedAttrs = [
  'repeatEnabled', 'canTransform', 'selectGroup', 'canChangeSize', 'autosize',
  'usesMachine', 'shouldCache', 'rotateCompleteLoop'
]
const newLayerType = localStorage.getItem('currentShape') || 'polygon'
const newLayerName = getShape({type: newLayerType}).name.toLowerCase()

const layersSlice = createSlice({
  name: 'layer',
  initialState: {
    current: null,
    selected: null,
    newLayerType: newLayerType,
    newLayerName: newLayerName,
    newLayerNameOverride: false,
    copyLayerName: null,
    byId: {},
    allIds: []
  },
  reducers: {
    addLayer(state, action) {
      let layer = { ...action.payload }
      layer.id = uniqueId('layer-')
      layer.name = layer.name || state.newLayerName
      state.byId[layer.id] = layer
      state.allIds.push(layer.id)
      state.current = layer.id
      state.selected = layer.id
      state.newLayerNameOverride = false
      state.newLayerName = layer.name
      if (layer.type !== 'file_import' && !layer.effect) {
        localStorage.setItem('currentShape', layer.type)
      }
    },
    moveLayer(state, action) {
      const { oldIndex, newIndex } = action.payload
      state.allIds = arrayMove(state.allIds, oldIndex, newIndex)
    },
    copyLayer(state, action) {
      const source = state.byId[action.payload]
      const layer = { ...source, name: state.copyLayerName }
      layer.id = uniqueId('layer-')
      state.byId[layer.id] = layer
      state.allIds.push(layer.id)
      state.current = layer.id
      state.selected = layer.id
    },
    removeLayer(state, action) {
      const deleteId = action.payload
      const idx = state.allIds.findIndex(id => id === deleteId)
      state.allIds.splice(idx, 1)
      delete state.byId[deleteId]

      if (deleteId === state.current) {
        if (idx === state.allIds.length) {
          state.current = state.allIds[idx-1]
          state.selected = state.allIds[idx-1]
        } else {
          state.current = state.allIds[idx]
          state.selected = state.allIds[idx]
        }
      }
    },
    restoreDefaults(state, action) {
      const id = action.payload
      const layer = state.byId[id]
      const defaults = getShape(layer).getInitialState(layer)

      state.byId[layer.id] = {
        id: layer.id,
        name: layer.name,
        ...defaults
      }
    },
    setCurrentLayer(state, action) {
      const current = state.byId[action.payload]

      if (current) {
        state.current = current.id
        state.selected = current.id
        state.copyLayerName = current.name
      }
    },
    setSelectedLayer(state, action) {
      state.selected = action.payload
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
    setNewLayerType(state, action) {
      let attrs = { newLayerType: action.payload }
      if (!state.newLayerNameOverride) {
        const shape = getShape({type: action.payload})
        attrs.newLayerName = shape.name.toLowerCase()
      }
      Object.assign(state, attrs)
    },
    updateLayer(state, action) {
      const layer = action.payload
      state.byId[layer.id] = {...state.byId[layer.id], ...layer}
    },
    updateLayers(state, action) {
      Object.assign(state, action.payload)
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
    toggleVisible(state, action) {
      const transform = action.payload
      state.byId[transform.id].visible = !state.byId[transform.id].visible
    },
  }
})

export const {
  addLayer,
  copyLayer,
  moveLayer,
  removeLayer,
  restoreDefaults,
  setCurrentLayer,
  setSelectedLayer,
  setShapeType,
  setNewLayerType,
  updateLayer,
  updateLayers,
  toggleRepeat,
  toggleSpin,
  toggleGrow,
  toggleTrack,
  toggleTrackGrow,
  toggleVisible
} = layersSlice.actions

export default layersSlice.reducer
