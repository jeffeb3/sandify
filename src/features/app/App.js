import React, { Component } from 'react'
import {
  Col,
  Container,
  Row
} from 'react-bootstrap'
import { configureStore } from "@reduxjs/toolkit"
import { combineReducers } from 'redux'
import { Provider } from 'react-redux'

import appReducer from './appSlice'
import fileReducer from '../theta_rho/fileSlice'
import machineReducer from '../machine/machineSlice'
import gcodeReducer from '../gcode/gCodeSlice'
import wiperReducer from '../wiper/wiperSlice'
import shapesReducer from '../shapes/shapesSlice'
import transformsReducer from '../transforms/transformsSlice'
import turtleReducer from '../turtle/turtleSlice'
import Header from './Header'
import Footer from './Footer'
import InputTabs from './InputTabs'
import MachinePreview from '../machine/MachinePreview'
import { registeredShapes } from '../../common/registeredShapes'
import {
  addShape,
  setCurrentShape
} from '../shapes/shapesSlice'
import { addTransform } from '../transforms/transformsSlice'
import './App.scss'

const store = configureStore({
  reducer: combineReducers({
    app: appReducer,
    shapes: shapesReducer,
    transforms: transformsReducer,
    file: fileReducer,
    gcode: gcodeReducer,
    machine: machineReducer,
    wiper: wiperReducer,
    turtle: turtleReducer
  }),
})

// preload shapes into store
Object.keys(registeredShapes).forEach(key => {
  let shape = registeredShapes[key]
  let state = shape.getInitialState()

  state.id = key
  state.name = shape.name
  store.dispatch(addTransform( {id: state.id, repeatEnabled: state.repeatEnabled}))
  store.dispatch(addShape(state))
})
store.dispatch(setCurrentShape('polygon'))

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <div className="App">
          <Header />

          <main>
            <Container fluid>
              <Row className="pt-3">
                <Col lg={7}>
                  <InputTabs />
                </Col>

                <Col lg={5}>
                  <MachinePreview />
                </Col>
              </Row>
            </Container>
          </main>

          <Footer />
        </div>
      </Provider>
    )
  }
}

export default App
