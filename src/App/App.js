import React, { Component } from 'react';
import './App.css';
import { createStore } from 'redux';
import { Provider } from 'react-redux';

import reducer from '../reducers/Index.js';
import Header from './Header';
import Documentation from './Documentation';
import InputTabs from '../inputs/InputTabs';
import MachinePreview from '../machine/MachinePreview';
import GCodeGenerator from '../machine/GCode';

const store = createStore(reducer);

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
