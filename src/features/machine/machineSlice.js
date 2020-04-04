import { createSlice } from "@reduxjs/toolkit"

const machineSlice = createSlice({
  name: 'machine',
  initialState: {
    rectangular: undefined !== localStorage.getItem('machine_rect_active') ? localStorage.getItem('machine_rect_active') < 2 : true,
    rectExpanded: false,
    polarExpanded: false,
    minX: parseFloat(localStorage.getItem('machine_min_x') ? localStorage.getItem('machine_min_x') : 0),
    maxX: parseFloat(localStorage.getItem('machine_max_x') ? localStorage.getItem('machine_max_x') : 500),
    minY: parseFloat(localStorage.getItem('machine_min_y') ? localStorage.getItem('machine_min_y') : 0),
    maxY: parseFloat(localStorage.getItem('machine_max_y') ? localStorage.getItem('machine_max_y') : 500),
    maxRadius: parseFloat(localStorage.getItem('machine_radius') ? localStorage.getItem('machine_radius') : 250),
    rectOrigin: [],
    polarEndpoints: false,
    canvasWidth: 600,
    canvasHeight: 600,
    sliderValue: 0.0
  },
  reducers: {
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
    setMachineMinX(state, action) {
      state.minX = action.payload
      localStorage.setItem('machine_min_x', state.minX)
    },
    setMachineMaxX(state, action) {
      state.maxX = action.payload
      localStorage.setItem('machine_max_x', state.maxX)
    },
    setMachineMinY(state, action) {
      state.minY = action.payload
      localStorage.setItem('machine_min_y', state.minY)
    },
    setMachineMaxY(state, action) {
      state.maxY = action.payload
      localStorage.setItem('machine_max_y', state.maxY)
    },
    setMachineMaxRadius(state, action) {
      state.maxRadius = action.payload
      localStorage.setItem('machine_radius', state.maxRadius)
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
    toggleMachineEndpoints(state, action) {
      state.polarEndpoints = !state.polarEndpoints
    },
    setMachineSize(state, action) {
      state.canvasHeight = action.payload
      state.canvasWidth = action.payload
    },
    setMachineSlider(state, action) {
      state.sliderValue = action.payload
    }
  }
})

export const {
  toggleMachineRectExpanded,
  toggleMachinePolarExpanded,
  setMachineMinX,
  setMachineMaxX,
  setMachineMinY,
  setMachineMaxY,
  setMachineMaxRadius,
  setMachineRectOrigin,
  toggleMachineEndpoints,
  setMachineSize,
  setMachineSlider
} = machineSlice.actions

export default machineSlice.reducer
