import { createSlice } from '@reduxjs/toolkit'
import ReactGA from 'react-ga'

const shapesSlice = createSlice({
  name: 'shape',
  initialState: {
    currentId: null,
    byId: {},
    allIds: []
  },
  reducers: {
    addShape(state, action) {
      let shape = { ...action.payload }
      state.byId[shape.id] = shape
      state.allIds.push(shape.id)
    },
    setCurrentShape(state, action) {
      state.currentId = action.payload
      ReactGA.event({
        category: 'Shapes',
        action: 'setCurrentShape: ' + action.payload,
      })
      localStorage.setItem('currentShape', state.currentId)
    },
    updateShape(state, action) {
      const shape = action.payload
      state.byId[shape.id] = {...state.byId[shape.id], ...shape}
    }
  }
})

export const {
  addShape,
  setCurrentShape,
  updateShape
} = shapesSlice.actions

export default shapesSlice.reducer
