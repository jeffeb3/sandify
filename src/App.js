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
import GCodeGenerator from './GCode';

// I'm trying to define a simple struct that we can use everywhere we need vertices. I don't see a
// problem letting this bloat a little.
//
// Currently, I'm using this as input to the GCodeGenerator for the locations of gcode.
//
function vertex (x, y, speed=0) {
  return {
    x: x,
    y: y,
    f: speed
  }
}

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      vertices: [
        vertex(0.0, 0.0),
        vertex(1.0, 1.0),
      ],
    };
  }

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

          <div id="output">
            <GCodeGenerator vertices={this.state.vertices}/>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
