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
import Vicious1Vertices from './Vicious1Vertices';
import { Vertex } from '../Geometry';
import { connect } from 'react-redux'
import {
  addShape,
  setLoops,
  setShape,
  setShapeSize,
  setShapeOffset,
  setGrow,
  setSpin,
  toggleGrow,
  toggleSpin,
} from '../reducers/Index.js';

class Shape extends Component {

  render() {

    var activeClassName = "";
    if (this.props.active) {
      activeClassName = "active";
    }

    return (
      <div className="shape">
        <ListGroupItem className={activeClassName} onClick={this.props.clicked}>{this.props.name}</ListGroupItem>
      </div>
    )
  }
}

const shapeListProps = (state, ownProps) => {
  return {
    shapes: state.shapes,
    currentShape: state.currentShape,
    startingSize: state.startingSize,
    offset: state.shapeOffset,
  }
}

const shapeListDispatch = (dispatch, ownProps) => {
  return {
    addShape: (shape) => {
      dispatch(addShape(shape));
    },
    setShape: (name) => {
      dispatch(setShape(name));
    },
    onSizeChange: (event) => {
      dispatch(setShapeSize(event.target.value));
    },
    onOffsetChange: (event) => {
      dispatch(setShapeOffset(event.target.value));
    },
  }
}

class ShapeList extends Component {
  constructor(props) {
    super(props)

    let star_points = []
    for (let i=0; i<10; i++) {
      let angle = Math.PI * 2.0 / 10.0 * i
      let star_scale = 1.0
      if (i % 2 === 0) {
        star_scale *= 0.5
      }
      star_points.push(Vertex(star_scale * Math.cos(angle), star_scale * Math.sin(angle)))
    }
    let circle_points = []
    for (let i=0; i<128; i++) {
      let angle = Math.PI * 2.0 / 128.0 * i
      circle_points.push(Vertex(Math.cos(angle), Math.sin(angle)))
    }
    this.props.addShape({
        name: "Square",
        vertices: (state) => {
          return [
            Vertex(-1,-1),
            Vertex( 1,-1),
            Vertex( 1, 1),
            Vertex(-1, 1),
          ]},
      });
    this.props.addShape({
        name: "Triangle",
        vertices: (state) => {
          return [
            Vertex( 1, 0),
            Vertex( -0.5, 0.867),
            Vertex( -0.5, -0.867),
          ]},
      });
    this.props.addShape({
        name: "Star",
        vertices: (state) => {
          return star_points
        },
      });
    this.props.addShape({
        name: "Circle",
        vertices: (state) => {
          return circle_points
        },
      });
    this.props.addShape({
        name: "Vicious1",
        vertices: (state) => {
          return Vicious1Vertices()
        },
      });

  }

  render() {

    let self = this;

    var shape_render = this.props.shapes.map( (shape) => {
      return <Shape
            key={shape.name}
            name={shape.name}
            active={shape.name === self.props.currentShape}
            clicked={ () => { self.props.setShape(shape.name); } }
          />
    });

    return (
      <div className="shapes">
        <div className="shoptions">
          <Panel className="options-panel" collapsible expanded>
            <Form horizontal>
              <FormGroup controlId="shape-size">
                <Col componentClass={ControlLabel} sm={4}>
                  Starting Size
                </Col>
                <Col sm={8}>
                  <FormControl type="number" value={this.props.startingSize} onChange={this.props.onSizeChange}/>
                </Col>
              </FormGroup>
              <FormGroup controlId="shape-offset">
                <Col componentClass={ControlLabel} sm={4}>
                  Offset
                </Col>
                <Col sm={8}>
                  <FormControl type="number" value={this.props.offset} onChange={this.props.onOffsetChange}/>
                </Col>
              </FormGroup>
            </Form>
          </Panel>
        </div>
        <ListGroup>
          {shape_render}
        </ListGroup>
      </div>
    )
  }
}

ShapeList = connect(shapeListProps, shapeListDispatch)(ShapeList) ;


const rotateProps = (state, ownProps) => {
  return {
    active: state.spinEnabled,
    value: state.spinValue,
  }
}

const rotateDispatch = (dispatch, ownProps) => {
  return {
    activeCallback: () => {
      dispatch(toggleSpin());
    },
    onChange: (event) => {
      dispatch(setSpin(event.target.value));
    },
  }
}

class RotationTransform extends Component {

  render() {
    var activeClassName = "";
    if (this.props.active) {
      activeClassName = "active";
    }

    return (
      <div className="rotate">
        <ListGroupItem header="Spin" className={activeClassName} onClick={this.props.activeCallback}>Spins the input shape a little bit for each copy</ListGroupItem>
        <div className="rotate-options">
          <Panel className="options-panel" collapsible expanded={this.props.active}>
            <Form horizontal>
              <FormGroup controlId="rotate-step">
                <Col componentClass={ControlLabel} sm={4}>
                  Spin Step
                </Col>
                <Col sm={8}>
                  <FormControl type="number" step="0.1" value={this.props.value} onChange={this.props.onChange}/>
                </Col>
              </FormGroup>
            </Form>
          </Panel>
        </div>
      </div>
    )
  }
}
RotationTransform = connect(rotateProps, rotateDispatch)(RotationTransform) ;


const scaleProps = (state, ownProps) => {
  return {
    active: state.growEnabled,
    value: state.growValue,
  }
}

const scaleDispatch = (dispatch, ownProps) => {
  return {
    activeCallback: () => {
      dispatch(toggleGrow());
    },
    onChange: (event) => {
      dispatch(setGrow(event.target.value));
    },
  }
}

class ScaleTransform extends Component {

  render() {
    var activeClassName = "";
    if (this.props.active) {
      activeClassName = "active";
    }

    return (
      <div className="scale">
        <ListGroupItem header="Grow" className={activeClassName} onClick={this.props.activeCallback}>Grows or shrinks the input shape a little bit for each copy</ListGroupItem>
        <div className="scale-options">
          <Panel className="options-panel" collapsible expanded={this.props.active}>
            <Form horizontal>
              <FormGroup controlId="scale-step">
                <Col componentClass={ControlLabel} sm={4}>
                  Grow Step
                </Col>
                <Col sm={8}>
                  <FormControl type="number" value={this.props.value} onChange={this.props.onChange}/>
                </Col>
              </FormGroup>
            </Form>
          </Panel>
        </div>
      </div>
    )
  }
}
ScaleTransform = connect(scaleProps, scaleDispatch)(ScaleTransform) ;

const transformsProps = (state, ownProps) => {
  return {
    loops: state.numLoops,
  }
}

const transformsDispatch = (dispatch, ownProps) => {
  return {
    changeLoops: (event) => {
      dispatch(setLoops(event.target.value));
    },
  }
}

class Transforms extends Component {
  render() {

    return (
      <div className="transforms">
        <Panel className="shapes-panel">
          <h4>Input Shapes</h4>
          <ShapeList />
        </Panel>
        <Panel className="transforms-panel">
          <h4>Modifiers</h4>
          <Form horizontal>
            <FormGroup controlId="loop-count">
              <Col componentClass={ControlLabel} sm={4}>
                Num Loops
              </Col>
              <Col sm={8}>
                <FormControl type="number" value={this.props.loops} onChange={this.props.changeLoops}/>
              </Col>
            </FormGroup>
          </Form>
          <ListGroup>
            <RotationTransform
              />
            <ScaleTransform
              />
          </ListGroup>
        </Panel>
      </div>
    );
  }
}
Transforms = connect(transformsProps, transformsDispatch)(Transforms);


export default Transforms

