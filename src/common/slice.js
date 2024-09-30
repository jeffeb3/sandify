//
// Wrapper methods around slice and adapter actions consistent with how our our application
// uses the Redux store.
//
import { v4 as uuidv4 } from "uuid"

const selectedIndex = (state) => {
  const curr = state.entities[state.selected]
  return curr ? state.ids.findIndex((id) => id === curr.id) : -1
}

// Insert an entity at a specific index, which is not supported by addOne.
export const insertOne = (state, action) => {
  const index = state.selected ? selectedIndex(state) + 1 : 0
  const entity = { ...action.payload }

  state.ids.splice(index, 0, entity.id)
  state.entities[entity.id] = entity
  state.current = entity.id

  return entity
}

export const prepareAfterAdd = (entity) => {
  const id = uuidv4()

  // return newly generated id so downstream actions can use it
  return { payload: { ...entity, id }, meta: { id } }
}

export const updateOne = (adapter, state, action) => {
  const entity = action.payload

  adapter.updateOne(state, { id: entity.id, changes: entity })
}
