import { createSlice } from "@reduxjs/toolkit"

const transformsSlice = createSlice({
  name: 'transforms',
  initialState: {
    starting_size: 10.0,    
    xformOffsetX: 0.0,
    xformOffsetY: 0.0,
    numLoops: 10,
    growEnabled: true,
    growValue: 100,
    spinEnabled: false,
    spinValue: 2,
    spinSwitchbacks: 0,
    trackEnabled: false,
    trackGrowEnabled: false,
    trackValue: 10,
    trackLength: 0.2,
    trackGrow: 50.0,
  },
  reducers: {
    setShapeStartingSize(state, action) {
      state.starting_size = action.payload
    },
    setXFormOffsetX(state, action) {
      state.xformOffsetX = parseFloat(action.payload)
    },
    setXFormOffsetY(state, action) {
      state.xformOffsetY = parseFloat(action.payload)
    },
    setNumLoops(state, action) {
      state.numLoops = action.payload
    },
    toggleSpin(state, action) {
      state.spinEnabled = !state.spinEnabled
    },
    setSpin(state, action) {
      state.spinValue = action.payload
    },
    setSpinSwitchbacks(state, action) {
      state.spinSwitchbacks = action.payload >= 0 ? action.payload : 0
    },
    toggleGrow(state, action) {
      state.growEnabled = !state.growEnabled
    },
    setGrow(state, action) {
      state.growValue = action.payload
    },
    toggleTrack(state, action) {
      state.trackEnabled = !state.trackEnabled
    },
    toggleTrackGrow(state, action) {
      state.trackGrowEnabled = !state.trackGrowEnabled
    },
    setTrack(state, action) {
      state.trackValue = action.payload
    },
    setTrackLength(state, action) {
      state.trackLength = action.payload
    },
    setTrackGrow(state, action) {
      state.trackGrow = action.payload
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
