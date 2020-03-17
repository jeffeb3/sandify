import React, { Component } from 'react'
import {
  Col,
  Container,
  Row
} from 'react-bootstrap'
import { configureStore } from "@reduxjs/toolkit"
import { combineReducers } from 'redux'
import { Provider } from 'react-redux'
import appReducer from './appSlice.js'
import fileReducer from '../theta_rho/fileSlice.js'
import machineReducer from '../machine/machineSlice.js'
import gcodeReducer from '../gcode/gCodeSlice.js'
import wiperReducer from '../wiper/wiperSlice.js'
import shapesReducer from '../shapes/shapeSlice.js'
import transformsReducer from '../transforms/transformsSlice.js'
import turtleReducer from '../turtle/turtleSlice.js'
import Header from './Header'
import Footer from './Footer'
import InputTabs from './InputTabs'
import MachinePreview from '../machine/MachinePreview'
import './App.css'

const store =
  configureStore({
    reducer: combineReducers({
      app: appReducer,
      file: fileReducer,
      gcode: gcodeReducer,
      machine: machineReducer,
      shapes: shapesReducer,
      transform: transformsReducer,
      wiper: wiperReducer,
      turtle: turtleReducer
    })});

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <div className="App">
          <Header />

          <main>
            <Container fluid>
              <Row className="pt-3">
                <Col md={7}>
                  <InputTabs />
                </Col>

                <Col md={5}>
                  <MachinePreview />
                </Col>
              </Row>
            </Container>
          </main>

          <Footer />
        </div>
      </Provider>
    );
  }
}

export default App;
