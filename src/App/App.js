import React, { Component } from 'react';
import './App.css';
import { createStore } from 'redux';
import { combineReducers } from 'redux';
import { Provider } from 'react-redux';

import app from '../reducers/App.js';
import file from '../reducers/File.js';
import gcode from '../reducers/GCode.js';
import machine from '../reducers/Machine.js';
import shapes from '../reducers/Shapes.js';
import transform from '../reducers/Transform.js';
import wiper from '../reducers/Wiper.js';
import Header from './Header';
import Documentation from './Documentation';
import InputTabs from '../inputs/InputTabs';
import MachinePreview from '../machine/MachinePreview';
import GCodeGenerator from '../machine/GCode';

const store =
  createStore(
    combineReducers(
      {
        app,
        file,
        gcode,
        machine,
        shapes,
        transform,
        wiper,
      }));

class App extends Component {

  render() {

    return (
      <Provider store={store}>
        <div className="App">

          <div className="App-header">
            <Header/>
          </div>

          <div className="App-col-7 App-left">
            <InputTabs/>
          </div>

          <div className="App-col-5 App-mid">
            <div className="App-canvas">
              <MachinePreview/>
            </div>

            <div id="output">
              <GCodeGenerator/>
            </div>
          </div>
          <div className="App-col-12 App-doc">
            <Documentation/>
          </div>

        </div>
      </Provider>
    );
  }
}

export default App;
