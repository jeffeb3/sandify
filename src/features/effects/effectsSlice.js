import { createSlice, createEntityAdapter } from "@reduxjs/toolkit"
import { createSelector, createSelectorCreator, lruMemoize } from "reselect"
import { createCachedSelector } from "re-reselect"
import { isEqual } from "lodash"
import { insertOne, prepareAfterAdd, updateOne } from "@/common/slice"
import { selectState } from "@/features/app/appSlice"
import EffectLayer from "./EffectLayer"
import { getEffect } from "@/features/effects/effectFactory"

// ------------------------------
// Slice, reducers and atomic actions
// ------------------------------

const adapter = createEntityAdapter()

export const effectsSlice = createSlice({
  name: "effects",
  initialState: adapter.getInitialState(),
  reducers: {
    addEffect: {
      reducer(state, action) {
        const effect = insertOne(state, action)

        state.selected = effect.id
        localStorage.setItem("defaultEffect", effect.type)
      },
      prepare(effect) {
        return prepareAfterAdd(effect)
      },
    },
    deleteEffect: (state, action) => {
      adapter.removeOne(state, action)
    },
    updateEffect: (state, action) => {
      updateOne(adapter, state, action)
    },
    setCurrentEffect: (state, action) => {
      const id = action.payload

      if (!id) {
        state.current = null // preserve selection
      } else if (state.entities[id]) {
        state.current = id
        state.selected = id
      }
    },
    setSelectedEffect: (state, action) => {
      const id = action.payload

      if (!id) {
        state.current = null // preserve selection
      } else if (state.entities[id]) {
        state.selected = id
      }
    },
    restoreDefaults: (state, action) => {
      const id = action.payload
      const { type, name, layerId } = state.entities[id]
      const layer = new EffectLayer(type)

      adapter.setOne(state, {
        id,
        name,
        layerId,
        ...layer.getInitialState(),
      })
    },
    randomizeValues: (state, action) => {
      const id = action.payload
      const effectLayer = state.entities[id]
      const effect = getEffect(effectLayer.type)
      const changes = effect.randomChanges(effectLayer)
      adapter.updateOne(state, { id, changes })
    },
  },
})

export default effectsSlice.reducer
export const {
  addEffect,
  deleteEffect,
  updateEffect,
  setCurrentEffect,
  setSelectedEffect,
  restoreDefaults,
  randomizeValues,
} = effectsSlice.actions

// ------------------------------
// Selectors
// ------------------------------

export const {
  selectAll: selectAllEffects,
  selectById: selectEffectById,
  selectIds: selectEffectIds,
  selectEntities: selectEffectEntities,
  selectNumEffects: selectTotal,
} = adapter.getSelectors((state) => state.effects)

export const selectEffects = createSelector(
  selectState,
  (state) => state.effects,
)

export const selectEffectsByLayerId = createCachedSelector(
  selectAllEffects,
  (state, layerId) => layerId,
  (effects, layerId) => {
    return effects.filter((effect) => effect.layerId === layerId)
  },
)({
  keySelector: (state, layerId) => layerId,
})

export const selectCurrentEffectId = createSelector(
  selectEffects,
  (effects) => effects.current,
)

export const selectSelectedEffectId = createSelector(
  selectEffects,
  (effects) => effects.selected,
)

export const selectCurrentEffect = createSelector(
  [selectEffectEntities, selectCurrentEffectId],
  (effects, currentId) => {
    return effects[currentId]
  },
)

export const selectSelectedEffect = createSelector(
  [selectEffectEntities, selectSelectedEffectId],
  (effects, selectedId) => {
    return effects[selectedId]
  },
)

// returns the selection vertices for a given effect
export const selectEffectSelectionVertices = createCachedSelector(
  selectEffectById,
  (effect) => {
    if (!effect) {
      return []
    } // zombie child

    const instance = new EffectLayer(effect.type)
    return instance.getSelectionVertices(effect)
  },
)({
  keySelector: (state, id) => id,
  selectorCreator: createSelectorCreator(lruMemoize, {
    equalityCheck: isEqual,
  }),
})
