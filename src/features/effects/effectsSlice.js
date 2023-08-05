import { createSlice, createEntityAdapter } from "@reduxjs/toolkit"
import { createCachedSelector } from "re-reselect"
import { v4 as uuidv4 } from "uuid"

// ------------------------------
// Slice, reducers and atomic actions
// ------------------------------

const effectsAdapter = createEntityAdapter()

const currEffectIndex = (state) => {
  const currentEffect = state.entities[state.current]
  return state.ids.findIndex((id) => id === currentEffect.id)
}

export const effectsSlice = createSlice({
  name: "effects",
  initialState: effectsAdapter.getInitialState(),
  reducers: {
    addEffect: {
      reducer(state, action) {
        // we need to insert at a specific index, which is not supported by addOne
        const index = state.current ? currEffectIndex(state) + 1 : 0
        const effect = action.payload

        state.ids.splice(index, 0, effect.id)
        state.entities[effect.id] = effect
        state.current = effect.id
        localStorage.setItem("defaultModel", effect.type)
      },
      prepare(effect) {
        const id = uuidv4()

        // return newly generated id so downstream actions can use it
        return { payload: { ...effect, id }, meta: { id } }
      },
    },
    deleteEffect: (state, action) => {
      const deleteId = action.payload
      const deleteIdx = state.ids.findIndex((id) => id === deleteId)
      effectsAdapter.removeOne(state, deleteId)

      if (deleteId === state.current) {
        const idx = deleteIdx === state.ids.length ? deleteIdx - 1 : deleteIdx
        state.current = state.ids[idx]
      }
    },
    updateEffect: (state, action) => {
      const effect = action.payload
      effectsAdapter.updateOne(state, { id: effect.id, changes: effect })
    },
  },
})

export default effectsSlice.reducer
export const { addEffect, deleteEffect, updateEffect } = effectsSlice.actions

// ------------------------------
// Selectors
// ------------------------------

export const {
  selectAll: selectAllEffects,
  selectById: selectEffectById,
  selectIds: selectEffectIds,
} = effectsAdapter.getSelectors((state) => state.effects)

export const selectEffectsByLayerId = createCachedSelector(
  selectAllEffects,
  (state, layerId) => layerId,
  (effects, layerId) => {
    return effects.filter((effect) => effect.layerId === layerId)
  },
)({
  keySelector: (state, layerId) => layerId,
})
