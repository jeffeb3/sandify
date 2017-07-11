import React, { Component } from 'react';
import './App.css';

import Header from './Header';
import Documentation from './Documentation';
import InputTabs from './inputs/InputTabs';
import MachinePreview from './MachinePreview';
import GCodeGenerator from './GCode';
import enforceLimits from './LimitEnforcer';

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      vertices: [
      ],
      min_x: 0.0,
      max_x: 500.0,
      min_y: 0.0,
      max_y: 500.0,
    }
    this.onMinXChange = this.onMinXChange.bind(this)
    this.onMaxXChange = this.onMaxXChange.bind(this)
    this.onMinYChange = this.onMinYChange.bind(this)
    this.onMaxYChange = this.onMaxYChange.bind(this)

    this.setVertices = this.setVertices.bind(this);
  }

  onMinXChange(event) {
    this.setState({ min_x: event.target.value })
  }

  onMaxXChange(event) {
    this.setState({ max_x: event.target.value })
  }

  onMinYChange(event) {
    this.setState({ min_y: event.target.value })
  }

  onMaxYChange(event) {
    this.setState({ max_y: event.target.value })
  }

  setVertices(vertices) {
    vertices = enforceLimits(vertices,
                             (this.state.max_x - this.state.min_x)/2.0,
                             (this.state.max_y - this.state.min_y)/2.0
                             );
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
          <InputTabs vertices={this.state.vertices} setVertices={this.setVertices}/>
        </div>

        <div className="App-right">
          <div className="App-canvas">
            <MachinePreview
              canvas_width={600}
              canvas_height={600}
              min_x={this.state.min_x}
              max_x={this.state.max_x}
              min_y={this.state.min_y}
              max_y={this.state.max_y}
              onMinXChange={this.onMinXChange}
              onMaxXChange={this.onMaxXChange}
              onMinYChange={this.onMinYChange}
              onMaxYChange={this.onMaxYChange}
              vertices={this.state.vertices}
              />
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
