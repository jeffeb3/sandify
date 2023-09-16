import { createSlice, createEntityAdapter } from "@reduxjs/toolkit"
import { createSelector } from "reselect"
import { v4 as uuidv4 } from "uuid"
import { prepareAfterAdd, deleteOne, updateOne } from "@/common/slice"
import { selectState } from "@/features/app/appSlice"
import { getMachine, getDefaultMachineType } from "./machineFactory"

// ------------------------------
// Slice, reducers and atomic actions
// ------------------------------

const adapter = createEntityAdapter()
const defaultMachine = getMachine(getDefaultMachineType())
const defaultMachineId = uuidv4()
const notCopiedWhenTypeChanges = ["type"]
const defaultMachineState = {
  id: defaultMachineId,
  ...defaultMachine.getInitialState(),
}

export const machinesSlice = createSlice({
  name: "machines",
  initialState: adapter.getInitialState({
    current: defaultMachineId,
    entities: {
      [defaultMachineId]: defaultMachineState,
    },
    ids: [defaultMachineId],
  }),
  reducers: {
    addMachine: {
      reducer(state, action) {
        adapter.addOne(state, action)
        state.current = state.ids[state.ids.length - 1]
      },
      prepare(machine) {
        return prepareAfterAdd(machine)
      },
    },
    deleteMachine: (state, action) => {
      const id = action.payload
      const ids = state.ids
      const deleteIdx = ids.findIndex((_id) => _id === id)
      const currentMachineId = state.current

      deleteOne(adapter, state, action)

      if (id === currentMachineId) {
        const newIds = ids.filter((i) => i != id)
        const idx = deleteIdx === ids.length - 1 ? deleteIdx - 1 : deleteIdx
        state.current = newIds[idx]
      }
    },
    updateMachine: (state, action) => {
      updateOne(adapter, state, action)
    },
    setCurrentMachine: (state, action) => {
      state.current = action.payload
    },
    changeMachineType: (state, action) => {
      const { type, id } = action.payload
      const machineState = state.entities[id]
      const machine = getMachine(type)
      const newMachineState = machine.getInitialState()

      Object.keys(newMachineState).forEach((attr) => {
        if (
          !notCopiedWhenTypeChanges.includes(attr) &&
          machineState[attr] != undefined
        ) {
          newMachineState[attr] = machineState[attr]
        }
      })

      newMachineState.id = id
      adapter.setOne(state, newMachineState)
    },
  },
})

export default machinesSlice.reducer
export const { actions: machinesActions } = machinesSlice
export const {
  addMachine,
  updateMachine,
  setCurrentMachine,
  deleteMachine,
  changeMachineType,
} = machinesSlice.actions

// ------------------------------
// Selectors
// ------------------------------

export const {
  selectAll: selectAllMachines,
  selectIds: selectMachineIds,
  selectTotal: selectNumMachines,
  selectEntities: selectMachineEntities,
} = adapter.getSelectors((state) => state.machines)

export const selectMachines = createSelector(
  selectState,
  (state) => state.machines,
)

export const selectCurrentMachineId = createSelector(
  selectMachines,
  (machines) => machines.current,
)

export const selectCurrentMachine = createSelector(
  [selectMachineEntities, selectCurrentMachineId],
  (machines, currentId) => {
    return machines[currentId]
  },
)
