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
  constructor(props) {
    super(props)
    this.state = {

    }

    this.inputVertices = []

    // bind things
    this.setVertices = this.setVertices.bind(this);
    this.updateVertices();
  }

  setVertices(vertices) {
    this.inputVertices = vertices;

  }

  updateVertices() {
    var outputVertices = [
      Vertex(0.0, 0.0),
      Vertex(10.0, 10.0)
    ]

    this.setState({outputVertices: outputVertices});
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
