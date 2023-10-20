import { createSlice, createEntityAdapter } from "@reduxjs/toolkit"
import { createSelector } from "reselect"
import { v4 as uuidv4 } from "uuid"
import { prepareAfterAdd, updateOne } from "@/common/slice"
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

      adapter.removeOne(state, action)

      if (id === currentMachineId) {
        const newIds = ids.filter((i) => i != id)
        const idx = deleteIdx === ids.length - 1 ? deleteIdx - 1 : deleteIdx
        state.current = newIds[idx]
      }
    },
    updateMachine: (state, action) => {
      updateOne(adapter, state, action)
    },
    upsertImportedMachine: {
      reducer(state, action) {
        const machines = Object.values(state.entities)
        const importedIdx = machines.findIndex(
          (machine) => machine.name == "[imported]",
        )

        if (importedIdx !== -1) {
          const existingId = machines[importedIdx].id

          action.payload.id = existingId
          action.payload.name = "[imported]"
          updateOne(adapter, state, action)
          state.current = existingId
        } else {
          action.payload = {
            ...action.payload,
            name: "[imported]",
            imported: true,
          }
          adapter.addOne(state, action)
          state.current = state.ids[state.ids.length - 1]
        }
      },
      prepare(machine) {
        return prepareAfterAdd(machine)
      },
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
  upsertImportedMachine,
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
