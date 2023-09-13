import { createSlice, createEntityAdapter } from "@reduxjs/toolkit"
import { v4 as uuidv4 } from "uuid"
import {
  insertOne,
  prepareAfterAdd,
  deleteOne,
  updateOne,
} from "@/common/slice"

// ------------------------------
// Slice, reducers and atomic actions
// ------------------------------

const adapter = createEntityAdapter()
const defaultMachineId = uuidv4()
export const defaultMachineState = {
  rectangular: true,
  rectExpanded: false,
  polarExpanded: false,
  minX: 0,
  maxX: 500,
  minY: 0,
  maxY: 500,
  maxRadius: 250,
  minimizeMoves: false,
  rectOrigin: [],
  polarStartPoint: "none",
  polarEndPoint: "none",
  id: defaultMachineId,
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
export const { addMachine, deleteMachine, updateMachine, setCurrentMachine } =
  machinesSlice.actions
