import React, { Component } from 'react';

import './Transforms.css'
import Vertex from '../Geometry';

class BaseInput extends Component {

  componentWillMount(){
    this.updateVertices();
  }

  updateVertices(outputVertices) {
    var outputVertices = [
      Vertex(0.0, 0.0),
      Vertex(1.0, 1.0)
    ]

    this.props.setVertices(outputVertices);
  }

  render() {
    return (
      <div className="transforms">
        Base Input
      </div>
    );
  }
}

export default BaseInput
