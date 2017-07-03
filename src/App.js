import React, { Component } from 'react';
import {
    Button,
} from 'react-bootstrap'
import './App.css';

import Header from './Header';
import Documentation from './Documentation';
import Shapes from './Shapes';
import Transforms from './Transforms';
import TurtleCanvas from './TurtleCanvas';

class App extends Component {
  render() {

    return (
      <div className="App">

        <div className="App-header">
          <Header/>
        </div>

        <div className="App-left">
          <Documentation/>
        </div>

        <div className="App-mid">
          <Shapes />
          <Transforms />

          <div>
            <TurtleCanvas width={300} height={300} rotation={45}/>
          </div>

          <Button id="gcode" bsStyle="primary">Generate GCode</Button>
        </div>
      </div>
    );
  }
}

export default App;
