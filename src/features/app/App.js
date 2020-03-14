import React, { Component } from 'react';
import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from 'redux';
import { Provider } from 'react-redux';
import appReducer from './appSlice.js';
import fileReducer from '../theta_rho/fileSlice.js';
import machineReducer from '../machine/machineSlice.js';
import gcodeReducer from '../gcode/gCodeSlice.js';
import wiperReducer from '../wiper/wiperSlice.js';
import shapesReducer from '../shapes/shapesSlice.js';
import transformsReducer from '../transforms/transformsSlice.js';
import turtleReducer from '../turtle/turtleSlice.js';
import Header from './Header';
import Documentation from './Documentation';
import InputTabs from './InputTabs';
import MachinePreview from '../machine/MachinePreview';
import GCodeGenerator from '../gcode/GCodeGenerator';
import './App.css';

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
          <div className="App-header">
            <Header />
          </div>

          <div className="App-col-7 App-left">
            <InputTabs />
          </div>

          <div className="App-col-5 App-mid">
            <div className="App-canvas">
              <MachinePreview />
            </div>

            <div id="output">
              <GCodeGenerator />
            </div>
          </div>

          <div className="App-col-12 App-doc">
            <Documentation />
          </div>
        </div>
      </Provider>
    );
  }
}

export default App;
