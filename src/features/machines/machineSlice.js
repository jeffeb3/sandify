import Victor from "victor"
import { annotateVertices } from "@/common/geometry"
import { createSlice } from "@reduxjs/toolkit"
import { createSelector } from "reselect"
import { selectState } from "@/features/app/appSlice"
import PolarMachine from "./PolarMachine"
import RectMachine from "./RectMachine"

// ------------------------------
// Slice, reducers and atomic actions
// ------------------------------

const machineSlice = createSlice({
  name: "machine",
  initialState: {
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
  },
  reducers: {
    updateMachine(state, action) {
      Object.assign(state, action.payload)
    },
    toggleMachineRectExpanded(state, action) {
      state.rectangular = true
      state.rectExpanded = !state.rectExpanded
      state.polarExpanded = false
    },
    toggleMachinePolarExpanded(state, action) {
      state.rectangular = false
      state.rectExpanded = false
      state.polarExpanded = !state.polarExpanded
    },
    setMachineRectOrigin(state, action) {
      let newValue = []
      let value = action.payload

      for (let i = 0; i < value.length; i++) {
        if (!state.rectOrigin.includes(value[i])) {
          newValue.push(value[i])
          break
        }
      }
      state.rectOrigin = newValue
    },
    toggleMinimizeMoves(state, action) {
      state.minimizeMoves = !state.minimizeMoves
    },
  },
})

export const {
  updateMachine,
  toggleMachineRectExpanded,
  toggleMachinePolarExpanded,
  setMachineRectOrigin,
  setMachineSize,
  toggleMinimizeMoves,
} = machineSlice.actions

export default machineSlice.reducer

// ------------------------------
// Selectors and utility functions
// ------------------------------

// returns the appropriate machine class for given machine properties
export const getMachineInstance = (vertices, settings, layerInfo) => {
  const machineClass = settings.rectangular ? RectMachine : PolarMachine
  return new machineClass(vertices, settings, layerInfo)
}

// looks for vertices with connect = true. When found, adds vertices that connect that vertex
// with the next one in the array along the machine perimeter. Returns a modified array that
// includes connectors.
export const connectMarkedVerticesAlongMachinePerimeter = (
  vertices,
  machineState,
) => {
  const machine = getMachineInstance([], machineState)
  const newVertices = []

  for (let i = 0; i < vertices.length; i++) {
    const vertex = vertices[i]

    newVertices.push(vertex)
    if (vertex.connector) {
      vertex.hidden = false
      vertex.connect = true

      // connect the next two vertices along the machine perimeter
      const next = vertices[i + 1]

      if (next) {
        next.connect = true

        const clipped = machine.clipLine(
          new Victor(vertex.x - machine.sizeX * 2, vertex.y),
          new Victor(vertex.x + machine.sizeX * 2, vertex.y),
        )
        const clipped2 = machine.clipLine(
          new Victor(next.x - machine.sizeX * 2, next.y),
          new Victor(next.x + machine.sizeX * 2, next.y),
        )

        const connector = annotateVertices(
          [
            clipped[1],
            ...machine.tracePerimeter(clipped[1], clipped2[0]),
            clipped2[0],
          ],
          { connect: true },
        )

        newVertices.push(connector)
      }
    }
  }

  return newVertices.flat()
}

export const selectMachine = createSelector(
  selectState,
  (state) => state.machine,
)
