import { createSlice, createEntityAdapter } from "@reduxjs/toolkit"
import { createSelector } from "reselect"
import { v4 as uuidv4 } from "uuid"
import {
  insertOne,
  prepareAfterAdd,
  deleteOne,
  updateOne,
} from "@/common/slice"
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
        insertOne(state, action)
      },
      prepare(machine) {
        return prepareAfterAdd(machine)
      },
    },
    deleteMachine: (state, action) => {
      deleteOne(adapter, state, action)
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
    /*    restoreDefaults: (state, action) => {
      const id = action.payload
      const { type, name, layerId } = state.entities[id]
      const layer = new EffectLayer(type)

      adapter.setOne(state, {
        id,
        name,
        layerId,
        ...layer.getInitialState(),
      })
    }, */
  },
})

export default machinesSlice.reducer
export const { actions: machinesActions } = machinesSlice
export const {
  addMachine,
  deleteMachine,
  updateMachine,
  setCurrentMachine,
  changeMachineType,
} = machinesSlice.actions

// ------------------------------
// Selectors
// ------------------------------

export const {
  selectAll: selectAllMachines,
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
