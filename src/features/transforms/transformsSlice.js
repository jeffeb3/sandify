import { createSlice } from '@reduxjs/toolkit'
import Transform from '../../models/Transform'

const transformsSlice = createSlice({
  name: 'transforms',
  initialState: {
    byId: {},
    allIds: []
  },
  reducers: {
    addTransform(state, action) {
      const transform = action.payload
      const meta = new Transform()
      state.byId[transform.id] = {...meta.getInitialState(), ...transform}
      state.allIds.push(transform.id)
    },
    updateTransform(state, action) {
      const transform = action.payload
      state.byId[transform.id] = {...state.byId[transform.id], ...transform}
    },
    toggleRepeat(state, action) {
      const transform = action.payload
      state.byId[transform.id].repeatEnabled = !state.byId[transform.id].repeatEnabled
    },
    toggleGrow(state, action) {
      const transform = action.payload
      state.byId[transform.id].growEnabled = !state.byId[transform.id].growEnabled
    },
    toggleSpin(state, action) {
      const transform = action.payload
      state.byId[transform.id].spinEnabled = !state.byId[transform.id].spinEnabled
    },
    toggleTrack(state, action) {
      const transform = action.payload
      state.byId[transform.id].trackEnabled = !state.byId[transform.id].trackEnabled
    },
    toggleTrackGrow(state, action) {
      const transform = action.payload
      state.byId[transform.id].trackGrowEnabled = !state.byId[transform.id].trackGrowEnabled
    },
  }
})

export const {
  addTransform,
  updateTransform,
  toggleRepeat,
  toggleSpin,
  toggleGrow,
  toggleTrack,
  toggleTrackGrow,
} = transformsSlice.actions

export default transformsSlice.reducer
