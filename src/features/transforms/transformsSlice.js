import { createSlice } from "@reduxjs/toolkit"

const transformsSlice = createSlice({
  name: 'transforms',
  initialState: {
    starting_size: 10.0,
    offset_x: 0.0,
    offset_y: 0.0,
    num_loops: 10,
    grow_enabled: true,
    grow_value: 100,
    spin_enabled: false,
    spin_value: 2,
    spin_switchbacks: 0,
    track_enabled: false,
    track_grow_enabled: false,
    track_value: 10,
    track_length: 0.2,
    track_grow: 50.0,
  },
  reducers: {
    setShapeStartingSize(state, action) {
      state.starting_size = action.payload
    },
    setXFormOffsetX(state, action) {
      state.offset_x = parseFloat(action.payload)
    },
    setXFormOffsetY(state, action) {
      state.offset_y = parseFloat(action.payload)
    },
    setNumLoops(state, action) {
      state.num_loops = action.payload
    },
    toggleSpin(state, action) {
      state.spin_enabled = !state.spin_enabled
    },
    setSpin(state, action) {
      state.spin_value = action.payload
    },
    setSpinSwitchbacks(state, action) {
      state.spin_switchbacks = action.payload >= 0 ? action.payload : 0
    },
    toggleGrow(state, action) {
      state.grow_enabled = !state.grow_enabled
    },
    setGrow(state, action) {
      state.grow_value = action.payload
    },
    toggleTrack(state, action) {
      state.track_enabled = !state.track_enabled
    },
    toggleTrackGrow(state, action) {
      state.track_grow_enabled = !state.track_grow_enabled
    },
    setTrack(state, action) {
      state.track_value = action.payload
    },
    setTrackLength(state, action) {
      state.track_length = action.payload
    },
    setTrackGrow(state, action) {
      state.track_grow = action.payload
    },
  }
})

export const {
  setShapeStartingSize,
  setXFormOffsetX,
  setXFormOffsetY,
  setNumLoops,
  toggleSpin,
  setSpin,
  setSpinSwitchbacks,
  toggleGrow,
  setGrow,
  toggleTrack,
  toggleTrackGrow,
  setTrack,
  setTrackLength,
  setTrackGrow
} = transformsSlice.actions

export default transformsSlice.reducer
