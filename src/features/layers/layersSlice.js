import { createSlice } from '@reduxjs/toolkit'
import uniqueId from 'lodash/uniqueId'
import arrayMove from 'array-move'
import { getShape } from '../../models/shapes'

const protectedAttrs = [
  'repeatEnabled', 'canTransform', 'selectGroup', 'canChangeSize', 'autosize',
  'usesMachine', 'shouldCache', 'canChangeHeight', 'canRotate', 'usesFonts'
]

const newLayerType = localStorage.getItem('currentShape') || 'polygon'
const newLayerName = getShape({type: newLayerType}).name.toLowerCase()
const newEffectType = localStorage.getItem('currentEffect') || 'mask'
const newEffectName = getShape({type: newEffectType}).name.toLowerCase()

function createLayer(state, attrs) {
  const restore = attrs.restore
  delete attrs.restore
  const layer = {
    ...attrs,
    id: (restore && attrs.id) || uniqueId('layer-'),
    name: attrs.name || state.newLayerName,
  }

  state.byId[layer.id] = layer
  return layer
}

function deleteLayer(state, deleteId) {
  const idx = state.allIds.findIndex(id => id === deleteId)
  state.allIds.splice(idx, 1)
  delete state.byId[deleteId]
  return idx
}

function deleteEffect(state, deleteId) {
  const layer = state.byId[deleteId]
  const parent = state.byId[layer.parentId]

  const idx = parent.effectIds.findIndex(id => id === deleteId)
  parent.effectIds.splice(idx, 1)

  delete state.byId[deleteId]
  handleAfterDelete(state, deleteId, idx)
}

function createEffect(state, parent, attrs) {
  const effect = createLayer(state, {
    ...attrs,
    name: attrs.name || state.newEffectName
  })

  effect.parentId = parent.id
  parent.effectIds ||= []
  parent.effectIds.push(effect.id)
  parent.effectIds = [...new Set(parent.effectIds)]

  return effect
}

function handleAfterDelete(state, deletedId, deletedIdx) {
  if (deletedId === state.current) {
    if (deletedIdx === state.allIds.length) {
      setCurrentId(state, state.allIds[deletedIdx-1])
    } else {
      setCurrentId(state, state.allIds[deletedIdx])
    }
  }
}

function currLayerIndex(state) {
  const currentLayer = state.byId[state.current]
  return state.allIds.findIndex(id => id === currentLayer.id)
}

// TODO: remove this function when you refactor to remove 'selected' feature; currently disabled
function setCurrentId(state, id) {
  state.selected = id
  state.current = id
}

const layersSlice = createSlice({
  name: 'layer',
  initialState: {
    current: null,
    selected: null,
    newLayerType: newLayerType,
    newLayerName: newLayerName,
    newLayerNameOverride: false,
    newEffectType: newEffectType,
    newEffectName: newEffectName,
    newEffectNameOverride: false,
    copyLayerName: null,
    byId: {},
    allIds: []
  },
  reducers: {
    addLayer(state, action) {
      const index = state.current ? currLayerIndex(state) + 1 : 0
      const layer = createLayer(state, action.payload)

      state.allIds.splice(index, 0, layer.id)
      setCurrentId(state, layer.id)
      state.newLayerNameOverride = false
      state.newLayerName = layer.name

      if (layer.type !== 'file_import') {
        localStorage.setItem(layer.effect ? 'currentEffect' : 'currentShape', layer.type)
      }
    },
    moveLayer(state, action) {
      const { oldIndex, newIndex } = action.payload
      state.allIds = arrayMove(state.allIds, oldIndex, newIndex)
    },
    copyLayer(state, action) {
      const source = state.byId[action.payload]
      const layer = createLayer(state, {
        ...source,
        name: state.copyLayerName
      })
      delete layer.effectIds

      if (source.effectIds) {
        layer.effectIds = source.effectIds.map(effectId => {
          return createEffect(state, layer, state.byId[effectId]).id
        })
      }

      const index = state.allIds.findIndex(id => id === state.current) + 1
      state.allIds.splice(index, 0, layer.id)
      setCurrentId(state, layer.id)
      state.copyLayerName = null
    },
    removeLayer(state, action) {
      const id = action.payload
      const layer = state.byId[id]

      if (layer.effectIds) {
        layer.effectIds.forEach(effectId => {
          deleteEffect(state, effectId)
        })
      }

      const idx = deleteLayer(state, id)
      handleAfterDelete(state, id, idx)
    },
    addEffect(state, action) {
      const parent = state.byId[action.payload.parentId]
      if (parent === undefined) return

      const effect = createEffect(state, parent, action.payload)
      parent.open = true
      setCurrentId(state, effect.id)
    },
    removeEffect(state, action) {
      deleteEffect(state, action.payload)
    },
    moveEffect(state, action) {
      const { parentId, oldIndex, newIndex } = action.payload
      const parent = state.byId[parentId]
      parent.effectIds = arrayMove(parent.effectIds, oldIndex, newIndex)
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
        setCurrentId(state, current.id)
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
    setNewEffectType(state, action) {
      let attrs = { newEffectType: action.payload }
      if (!state.newEffectNameOverride) {
        const shape = getShape({type: action.payload})
        attrs.newEffectName = shape.name.toLowerCase()
      }
      Object.assign(state, attrs)
    },
    updateLayer(state, action) {
      const layer = action.payload
      const currLayer = state.byId[layer.id]
      state.byId[layer.id] = {...currLayer, ...layer}
    },
    updateLayers(state, action) {
      Object.assign(state, action.payload)
    },
    toggleRepeat(state, action) {
      const layer = action.payload
      state.byId[layer.id].repeatEnabled = !state.byId[layer.id].repeatEnabled
    },
    toggleGrow(state, action) {
      const layer = action.payload
      state.byId[layer.id].growEnabled = !state.byId[layer.id].growEnabled
    },
    toggleSpin(state, action) {
      const layer = action.payload
      state.byId[layer.id].spinEnabled = !state.byId[layer.id].spinEnabled
    },
    toggleTrack(state, action) {
      const layer = action.payload
      state.byId[layer.id].trackEnabled = !state.byId[layer.id].trackEnabled
    },
    toggleTrackGrow(state, action) {
      const layer = action.payload
      state.byId[layer.id].trackGrowEnabled = !state.byId[layer.id].trackGrowEnabled
    },
    toggleOpen(state, action) {
      const layer = action.payload
      state.byId[layer.id].open = !state.byId[layer.id].open
    },
    toggleVisible(state, action) {
      const layer = action.payload
      state.byId[layer.id].visible = !state.byId[layer.id].visible
    },
  }
})

export const {
  addLayer,
  copyLayer,
  moveLayer,
  removeLayer,
  addEffect,
  removeEffect,
  moveEffect,
  restoreDefaults,
  setCurrentLayer,
  setSelectedLayer,
  setShapeType,
  setNewLayerType,
  setNewEffectType,
  updateLayer,
  updateLayers,
  toggleRepeat,
  toggleSpin,
  toggleGrow,
  toggleTrack,
  toggleTrackGrow,
  toggleVisible,
  toggleOpen,
} = layersSlice.actions

export default layersSlice.reducer
