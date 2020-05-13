import { createSlice } from '@reduxjs/toolkit'
import ReactGA from 'react-ga'

const shapesSlice = createSlice({
  name: 'shape',
  initialState: {
    currentId: null,
    selectedId: null,
    byId: {},
    allIds: [],
    layerIds: []
  },
  reducers: {
    addShape(state, action) {
      let shape = { ...action.payload }
      state.byId[shape.id] = shape
      state.allIds.push(shape.id)
    },
    setCurrentShape(state, action) {
      state.currentId = action.payload
      state.selectedId = action.payload
      localStorage.setItem('currentShape', state.currentId)
      ReactGA.event({
        category: 'Shapes',
        action: 'setCurrentShape: ' + action.payload,
      })
    },
    updateShape(state, action) {
      const shape = action.payload
      state.byId[shape.id] = {...state.byId[shape.id], ...shape}
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
  addShape,
  setCurrentShape,
  updateShape,
  toggleRepeat,
  toggleSpin,
  toggleGrow,
  toggleTrack,
  toggleTrackGrow,
} = shapesSlice.actions

export default shapesSlice.reducer
