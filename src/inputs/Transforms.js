import React, { Component } from 'react';
import {
    Button,
    ButtonGroup,
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

class Shape extends Component {

  set() {
    this.props.activeCallback(this.props.name);
  }

  render() {

    var activeClassName = "";
    if (this.props.active) {
      activeClassName = "active";
    }

    return (
      <div className="shape">
        <ListGroupItem header={this.props.name} className={activeClassName} onClick={this.set.bind(this)}>{this.props.description}</ListGroupItem>
      </div>
    )
  }
}

class ShapeList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      shapes: [
        {
          name: "Square",
          description: "4 sided shape with equal sides and 90 degree angles",
          active: false,
          vertices: [
            Vertex(-1,-1),
            Vertex( 1,-1),
            Vertex( 1, 1),
            Vertex(-1, 1),
          ],
        },
        {
          name: "Triangle",
          description: "3 sided shape with equal sides and 120 degree angles",
          active: false,
          vertices: [
            Vertex( 1, 0),
            Vertex( -0.5, 0.867),
            Vertex( -0.5, -0.867),
          ],
        },
        {
          name: "Star",
          description: "5 pointed star",
          active: false,
          vertices: [
            Vertex(0.75,0.0),
            Vertex(0.987688340595,0.15643446504),
            Vertex(0.713292387221,0.231762745781),
            Vertex(0.891006524188,0.45399049974),
            Vertex(0.606762745781,0.440838939219),
            Vertex(0.707106781187,0.707106781187),
            Vertex(0.440838939219,0.606762745781),
            Vertex(0.45399049974,0.891006524188),
            Vertex(0.231762745781,0.713292387221),
            Vertex(0.15643446504,0.987688340595),
          ],
        },
      ]
    }
  }

  setShape(name) {
    var shapes = this.state.shapes
    for(var i=0; i<shapes.length; i++) {
      shapes[i].active=false;
      if (shapes[i].name === name) {
        shapes[i].active=true;
        this.props.setVertices(shapes[i].vertices);
      }
    }
    this.setState({ shapes: shapes })
  }

  render() {

    var self = this;

    var shape_render = this.state.shapes.map(function(shape) {
      return <Shape
            key={shape.name}
            name={shape.name}
            description={shape.description}
            active={shape.active}
            activeCallback={self.setShape.bind(self)}
          />
    });

    return (
      <div className="shapes">
        <ListGroup>
          {shape_render}
        </ListGroup>
      </div>
    )
  }
}

class Transforms extends Component {
  setVertices(vertices) {
    alert(vertices)
  }

  render() {

    return (
      <div className="transforms">
        <ShapeList setVertices={this.setVertices.bind(this)}/>

        <ButtonGroup>
          <Button id="rotate" active>Spin</Button>
          <Button id="scale">Grow</Button>
        </ButtonGroup>

        <Panel id="rotate-options" collapsible expanded={true}>
          <Form horizontal>
            <FormGroup controlId="rotate-step">
              <Col componentClass={ControlLabel} sm={2}>
                Spin Speed
              </Col>
              <Col sm={10}>
                <FormControl type="number"/>
              </Col>
            </FormGroup>
          </Form>
        </Panel>

        <Panel id="scale-options" collapsible expanded={true}>
          <Form horizontal>
            <FormGroup controlId="scale-step">
              <Col componentClass={ControlLabel} sm={2}>
                Scale Speed
              </Col>
              <Col sm={10}>
                <FormControl type="number"/>
              </Col>
            </FormGroup>
          </Form>
        </Panel>

      </div>
    );
  }
}

export default Transforms

