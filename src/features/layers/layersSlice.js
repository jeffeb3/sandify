import { createSlice } from "@reduxjs/toolkit"
import { v4 as uuidv4 } from "uuid"
import arrayMove from "array-move"
import { getModelFromType, getDefaultModelType } from "@/config/models"
import Layer from "./Layer"

const notCopiedWhenTypeChanges = ["type", "height", "width"]
const newEffectType = localStorage.getItem("currentEffect") || "mask"
const newEffectName = getModelFromType(newEffectType).label.toLowerCase()

function createLayer(state, attrs) {
  const restore = attrs.restore
  delete attrs.restore
  const layer = {
    ...attrs,
    id: (restore && attrs.id) || uuidv4(),
    name: attrs.name,
  }

  state.byId[layer.id] = layer
  return layer
}

function deleteLayer(state, deleteId) {
  const idx = state.allIds.findIndex((id) => id === deleteId)
  state.allIds.splice(idx, 1)
  delete state.byId[deleteId]
  return idx
}

function deleteEffect(state, deleteId) {
  const layer = state.byId[deleteId]
  const parent = state.byId[layer.parentId]

  const idx = parent.effectIds.findIndex((id) => id === deleteId)
  parent.effectIds.splice(idx, 1)

  delete state.byId[deleteId]
  handleAfterDelete(state, deleteId, idx)
}

function createEffect(state, parent, attrs) {
  const effect = createLayer(state, {
    ...attrs,
    name: attrs.name || state.newEffectName,
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
      setCurrentId(state, state.allIds[deletedIdx - 1])
    } else {
      setCurrentId(state, state.allIds[deletedIdx])
    }
  }
}

function currLayerIndex(state) {
  const currentLayer = state.byId[state.current]
  return state.allIds.findIndex((id) => id === currentLayer.id)
}

// TODO: remove this function when you refactor to remove 'selected' feature; currently disabled
function setCurrentId(state, id) {
  state.selected = id
  state.current = id
}

const defaultLayer = new Layer(getDefaultModelType())
const defaultLayerId = uuidv4()
const layerState = {
  id: defaultLayerId,
  ...defaultLayer.getInitialState(),
}

const layersSlice = createSlice({
  name: "layers",
  initialState: {
    current: defaultLayerId,
    selected: defaultLayerId,
    newEffectType,
    newEffectName,
    newEffectNameOverride: false,
    byId: {
      [defaultLayerId]: layerState,
    },
    allIds: [defaultLayerId],
  },
  reducers: {
    addLayer(state, action) {
      const index = state.current ? currLayerIndex(state) + 1 : 0
      const layer = createLayer(state, action.payload)

      state.allIds.splice(index, 0, layer.id)
      setCurrentId(state, layer.id)
      state.newLayerName = layer.name

      if (layer.type !== "fileImport") {
        localStorage.setItem(
          layer.effect ? "defaultEffect" : "defaultModel",
          layer.type,
        )
      }
    },
    moveLayer(state, action) {
      const { oldIndex, newIndex } = action.payload
      state.allIds = arrayMove(state.allIds, oldIndex, newIndex)
    },
    copyLayer(state, action) {
      const { id, name } = action.payload
      const source = state.byId[id]
      const layer = createLayer(state, {
        ...source,
        name,
      })
      delete layer.effectIds

      if (source.effectIds) {
        layer.effectIds = source.effectIds.map((effectId) => {
          return createEffect(state, layer, state.byId[effectId]).id
        })
      }

      const index = state.allIds.findIndex((id) => id === state.current) + 1
      state.allIds.splice(index, 0, layer.id)
      setCurrentId(state, layer.id)
    },
    removeLayer(state, action) {
      const id = action.payload
      const layer = state.byId[id]

      if (layer.effectIds) {
        layer.effectIds.forEach((effectId) => {
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
      const currentLayer = state.byId[id]
      const layer = new Layer(currentLayer.type)

      state.byId[id] = {
        id,
        name: currentLayer.name,
        ...layer.getInitialState(),
      }
    },
    setCurrentLayer(state, action) {
      const current = state.byId[action.payload]

      if (current) {
        setCurrentId(state, current.id)
      }
    },
    setSelectedLayer(state, action) {
      state.selected = action.payload
    },
    changeModelType(state, action) {
      const { type, id } = action.payload
      const newLayer = new Layer(type).getInitialState()
      const layer = state.byId[id]

      Object.keys(newLayer).forEach((attr) => {
        if (
          !notCopiedWhenTypeChanges.includes(attr) &&
          layer[attr] != undefined
        ) {
          newLayer[attr] = layer[attr]
        }
      })

      newLayer.id = id
      if (!newLayer.canMove) {
        newLayer.x = 0
        newLayer.y = 0
      }

      state.byId[id] = newLayer
    },
    setNewEffectType(state, action) {
      let attrs = { newEffectType: action.payload }
      if (!state.newEffectNameOverride) {
        const shape = getModelFromType(action.payload)
        attrs.newEffectName = shape.name.toLowerCase()
      }
      Object.assign(state, attrs)
    },
    updateLayer(state, action) {
      const layer = action.payload
      const currLayer = state.byId[layer.id]
      state.byId[layer.id] = { ...currLayer, ...layer }
    },
    updateLayers(state, action) {
      Object.assign(state, action.payload)
    },
    toggleOpen(state, action) {
      const layer = action.payload
      state.byId[layer.id].open = !state.byId[layer.id].open
    },
    toggleVisible(state, action) {
      const layer = action.payload
      state.byId[layer.id].visible = !state.byId[layer.id].visible
    },
  },
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
  changeModelType,
  setNewEffectType,
  updateLayer,
  updateLayers,
  toggleVisible,
  toggleOpen,
} = layersSlice.actions

export default layersSlice.reducer
