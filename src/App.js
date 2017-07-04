import React, { Component } from 'react';
import './App.css';

import Header from './Header';
import Documentation from './Documentation';
import Transforms from './inputs/Transforms';
import MachinePreview from './MachinePreview';
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

    this.setVertices = this.setVertices.bind(this);
  }

  setVertices(vertices) {
    this.setState({ vertices: vertices });
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
          <Transforms vertices={this.state.vertices} setVertices={this.setVertices}/>
        </div>

        <div className="App-right">
          <div className="App-canvas">
            <MachinePreview canvas_width={600} canvas_height={600} vertices={this.state.vertices}/>
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
