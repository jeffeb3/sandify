import React, { Component } from 'react';
import './App.css';

import Header from './Header';
import Documentation from './Documentation';
import Transforms from './inputs/Transforms';
import TurtleCanvas from './TurtleCanvas';
import GCodeGenerator from './GCode';
import Vertex from './Geometry';

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      vertices: [
        Vertex(0.0, 0.0),
        Vertex(1.0, 1.0),
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

          <Transforms vertices={this.state.vertices}/>

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
