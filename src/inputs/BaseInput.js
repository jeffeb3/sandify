import React, { Component } from 'react';
import {
    Col,
    ControlLabel,
    Form,
    FormControl,
    FormGroup,
    ListGroup,
    ListGroupItem,
    Panel,
} from 'react-bootstrap'
import './Transforms.css'
import Vertex from '../Geometry';

class BaseInput extends Component {

  componentWillMount(){
    this.updateVertices();
  }

  updateVertices() {
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
