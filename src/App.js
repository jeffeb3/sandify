import React, { Component } from 'react';
import './App.css';
import { createStore } from 'redux';
import { Provider } from 'react-redux';

import reducer from './reducers/Index.js';
import Header from './Header';
import Documentation from './Documentation';
import InputTabs from './inputs/InputTabs';
import MachinePreview from './MachinePreview';
import GCodeGenerator from './GCode';

const store = createStore(reducer);

class App extends Component {

  render() {

    return (
      <Provider store={store}>
        <div className="App">

          <div className="App-header">
            <Header/>
          </div>

          <div className="App-left">
            <Documentation/>
          </div>

          <div className="App-mid">
            <InputTabs/>
          </div>

          <div className="App-right">
            <div className="App-canvas">
              <MachinePreview
                canvas_width={600}
                canvas_height={600}
                />
            </div>

            <div id="output">
              <GCodeGenerator/>
            </div>
          </div>
        </div>
      </Provider>
    );
  }
}

export default App;
