import { createSlice } from "@reduxjs/toolkit"

// accommodate old and new local storage keys
const localMinX = parseFloat(localStorage.getItem('minX') || localStorage.getItem('machine_min_x'))
const localMaxX = parseFloat(localStorage.getItem('maxX') || localStorage.getItem('machine_max_x'))
const localMinY = parseFloat(localStorage.getItem('minY') || localStorage.getItem('machine_min_y'))
const localMaxY = parseFloat(localStorage.getItem('maxY') || localStorage.getItem('machine_max_y'))
const localMaxRadius = parseFloat(localStorage.getItem('maxRadius') || localStorage.getItem('machine_radius'))

const machineSlice = createSlice({
  name: 'machine',
  initialState: {
    rectangular: undefined !== localStorage.getItem('machine_rect_active') ? localStorage.getItem('machine_rect_active') < 2 : true,
    rectExpanded: false,
    polarExpanded: false,
    minX: localMinX || 0,
    maxX: localMaxX || 500,
    minY: localMinY || 0,
    maxY: localMaxY || 500,
    maxRadius: localMaxRadius || 250,
    minimizeMoves: JSON.parse(localStorage.getItem('minimizeMoves')) || false,
    rectOrigin: [],
    polarStartPoint: 'none',
    polarEndPoint: 'none',
    canvasWidth: 600,
    canvasHeight: 600,
    sliderValue: 0.0
  },
  reducers: {
    updateMachine(state, action) {
      Object.assign(state, action.payload)
      Object.keys(action.payload).forEach(key => {
        localStorage.setItem(key, action.payload[key])
      })
    },
    toggleMachineRectExpanded(state, action) {
      state.rectangular = true
      state.rectExpanded = !state.rectExpanded
      state.polarExpanded = false
      localStorage.setItem('machine_rect_active', 1)
    },
    toggleMachinePolarExpanded(state, action) {
      state.rectangular = false
      state.rectExpanded = false
      state.polarExpanded = !state.polarExpanded
      localStorage.setItem('machine_rect_active', 2)
    },
    setMachineRectOrigin(state, action) {
      let newValue = []
      let value = action.payload

      for (let i = 0; i < value.length ; i++) {
        if (!state.rectOrigin.includes(value[i])) {
          newValue.push(value[i])
          break
        }
      }
      state.rectOrigin = newValue
    },
    toggleMinimizeMoves(state, action) {
      state.minimizeMoves = !state.minimizeMoves
      localStorage.setItem('minimizeMoves', state.minimizeMoves)
    },
    setMachineSize(state, action) {
      state.canvasHeight = action.payload
      state.canvasWidth = action.payload
    },
  }
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
