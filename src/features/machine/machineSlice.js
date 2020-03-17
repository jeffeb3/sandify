import { createSlice } from "@reduxjs/toolkit"

const machineSlice = createSlice({
  name: 'machine',
  initialState: {
    rectangular: undefined !== localStorage.getItem('machine_rect_active') ? localStorage.getItem('machine_rect_active') < 2 : true,
    rect_expanded: false,
    polar_expanded: false,
    min_x: parseFloat(localStorage.getItem('machine_min_x') ? localStorage.getItem('machine_min_x') : 0),
    max_x: parseFloat(localStorage.getItem('machine_max_x') ? localStorage.getItem('machine_max_x') : 500),
    min_y: parseFloat(localStorage.getItem('machine_min_y') ? localStorage.getItem('machine_min_y') : 0),
    max_y: parseFloat(localStorage.getItem('machine_max_y') ? localStorage.getItem('machine_max_y') : 500),
    max_radius: parseFloat(localStorage.getItem('machine_radius') ? localStorage.getItem('machine_radius') : 250),
    rect_origin: [],
    polar_endpoints: false,
    canvas_width: 600,
    canvas_height: 600,
    slider_value: 0.0
  },
  reducers: {
    toggleMachineRectExpanded(state, action) {
      state.rectangular = true
      state.rect_expanded = !state.rect_expanded
      state.polar_expanded = false
      localStorage.setItem('machine_rect_active', 1)
    },
    toggleMachinePolarExpanded(state, action) {
      state.rectangular = false
      state.rect_expanded = false
      state.polar_expanded = !state.polar_expanded
      localStorage.setItem('machine_rect_active', 2)
    },
    setMachineMinX(state, action) {
      state.min_x = action.payload
      localStorage.setItem('machine_min_x', state.min_x)
    },
    setMachineMaxX(state, action) {
      state.max_x = action.payload
      localStorage.setItem('machine_max_x', state.max_x)
    },
    setMachineMinY(state, action) {
      state.min_y = action.payload
      localStorage.setItem('machine_min_y', state.min_y)
    },
    setMachineMaxY(state, action) {
      state.max_y = action.payload
      localStorage.setItem('machine_max_y', state.max_y)
    },
    setMachineMaxRadius(state, action) {
      state.max_radius = action.payload
      localStorage.setItem('machine_radius', state.max_radius)
    },
    setMachineRectOrigin(state, action) {
      let newValue = []
      let value = action.payload

      for (let i = 0; i < value.length ; i++) {
        if (!state.rect_origin.includes(value[i])) {
          newValue.push(value[i])
          break
        }
      }
      state.rect_origin = newValue
    },
    toggleMachineEndpoints(state, action) {
      state.polar_endpoints = !state.polar_endpoints
    },
    setMachineSize(state, action) {
      state.canvas_height = action.payload
      state.canvas_width = action.payload
    },
    setMachineSlider(state, action) {
      state.slider_value = action.payload
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
