import React, { Component } from 'react';
import {
    ListGroup,
    ListGroupItem,
} from 'react-bootstrap'
import './Shapes.css'

class Shapes extends Component {
  render() {
    function saySquare() {
        alert('Square!')
    }

    function sayTriangle() {
        alert('Triangle!')
    }

    return (
      <div className="shapes">
        <ListGroup>
          <ListGroupItem header="Square" active onClick={saySquare}>4 sided shape with equal sides and 90 degree angles</ListGroupItem>
          <ListGroupItem header="Triangle" onClick={sayTriangle}>3 sided shape with equal sides and 120 degree angles</ListGroupItem>
        </ListGroup>
      </div>
    );
  }
}

export default Shapes

