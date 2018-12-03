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
import Font1 from './Fonts';
import { Vertex } from '../Geometry';
import { connect } from 'react-redux'
import {
  addShape,
  setLoops,
  setShape,
  setShapePolygonSides,
  setShapeStarPoints,
  setShapeStarRatio,
  setShapeCircleLobes,
  setShapeInputText,
  setShapeSize,
  setShapeOffsetX,
  setShapeOffsetY,
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

    var options_render = this.props.options.map( (option) => {
      return <FormGroup controlId="options-step" key={option.title}>
               <Col componentClass={ControlLabel} sm={4}>
                 {option.title}
               </Col>
               <Col sm={8}>
                 <FormControl
                   type={option.type ? option.type : "number"}
                   step={option.step ? option.step : 1}
                   value={option.value()}
                   onChange={(event) => {
                     option.onChange(event)
                   }}/>
               </Col>
             </FormGroup>
    });

    var options_list_render = undefined;

    if (this.props.options.length >= 1) {
      options_list_render =
        <div className="shape-options">
          <Panel className="options-panel" collapsible expanded={this.props.active}>
            <Form horizontal>
              {options_render}
            </Form>
          </Panel>
        </div>
    }

    return (
      <div className="shape">
        <ListGroupItem className={activeClassName} onClick={this.props.clicked}>{this.props.name}</ListGroupItem>
            {options_list_render}
      </div>
    )
  }
}

const shapeListProps = (state, ownProps) => {
  return {
    shapes: state.shapes,
    polygonSides: state.shapePolygonSides,
    starPoints:   state.shapeStarPoints,
    starRatio:    state.shapeStarRatio,
    circleLobes:  state.shapeCircleLobes,
    inputText:    state.shapeInputText,
    currentShape: state.currentShape,
    startingSize: state.startingSize,
    x_offset: state.shapeOffsetX,
    y_offset: state.shapeOffsetY,
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
    onPolygonSizeChange: (event) => {
      dispatch(setShapePolygonSides(event.target.value));
    },
    onStarPointsChange: (event) => {
      dispatch(setShapeStarPoints(event.target.value));
    },
    onStarRatioChange: (event) => {
      dispatch(setShapeStarRatio(event.target.value));
    },
    onCircleLobesChange: (event) => {
      dispatch(setShapeCircleLobes(event.target.value));
    },
    onInputTextChange: (event) => {
      dispatch(setShapeInputText(event.target.value));
    },
    onSizeChange: (event) => {
      dispatch(setShapeSize(event.target.value));
    },
    onOffsetXChange: (event) => {
      dispatch(setShapeOffsetX(event.target.value));
    },
    onOffsetYChange: (event) => {
      dispatch(setShapeOffsetY(event.target.value));
    },
  }
}

class ShapeList extends Component {
  constructor(props) {
    super(props)

    this.props.addShape({
        name: "Polygon",
        vertices: (state) => {
          let points = [];
          for (let i=0; i<state.shapePolygonSides; i++) {
            let angle = Math.PI * 2.0 / state.shapePolygonSides * (0.5 + i);
            points.push(Vertex(Math.cos(angle), Math.sin(angle)))
          }
          return points;
        },
        options: [
          {
            title: "Number of Sides",
            value: () => { return this.props.polygonSides },
            onChange: this.props.onPolygonSizeChange,
          },
        ],
      });
    this.props.addShape({
        name: "Star",
        vertices: (state) => {
          let star_points = [];
          for (let i=0; i<state.shapeStarPoints * 2; i++) {
            let angle = Math.PI * 2.0 / (2.0 * state.shapeStarPoints) * i;
            let star_scale = 1.0;
            if (i % 2 === 0) {
              star_scale *= state.shapeStarRatio;
            }
            star_points.push(Vertex(star_scale * Math.cos(angle), star_scale * Math.sin(angle)))
          }
          return star_points
        },
        options: [
          {
            title: "Number of Points",
            value: () => { return this.props.starPoints },
            onChange: this.props.onStarPointsChange,
          },
          {
            title: "Size of Points",
            value: () => { return this.props.starRatio },
            onChange: this.props.onStarRatioChange,
            step: 0.05,
          },
        ],
      });
    this.props.addShape({
        name: "Circle",
        vertices: (state) => {
          let circle_points = []
          for (let i=0; i<128; i++) {
            let angle = Math.PI * 2.0 / 128.0 * i
            circle_points.push(Vertex(Math.cos(angle), Math.sin(state.shapeCircleLobes * angle)/state.shapeCircleLobes))
          }
          return circle_points
        },
        options: [
          {
            title: "Number of Lobes",
            value: () => { return this.props.circleLobes },
            onChange: this.props.onCircleLobesChange,
          },
        ],
      });
    this.props.addShape({
        name: "Text",
        vertices: (state) => {
          let points = [];
          const under_y = -0.5;
          points.push(Vertex(0.0, under_y))
          console.log("text: " + state.shapeInputText);
          let x = 0.0;
          for (let chi = 0; chi < state.shapeInputText.length; chi++) {
            var letter = Font1(state.shapeInputText[chi]);
            if (0 < letter.vertices.length) {
              points.push(Vertex(x + letter.vertices[0].x, under_y))
            }
            for (let vi = 0; vi < letter.vertices.length; vi++) {
              points.push(Vertex(letter.vertices[vi].x + x, letter.vertices[vi].y));
            }
            if (0 < letter.vertices.length) {
              points.push(Vertex(x + letter.vertices[letter.vertices.length-1].x, under_y))
            }
            if (chi !== state.shapeInputText.length-1) {
              points.push(Vertex(x + letter.max_x, under_y))
            }
            x += letter.max_x;
          }
          let widthOffset = x / 2.0;
          return points.map( (point) => {
            return Vertex(point.x - widthOffset, point.y);
          });
        },
        options: [
          {
            title: "Text",
            type: "textarea",
            value: () => { return this.props.inputText },
            onChange: this.props.onInputTextChange,
          },
        ],
      });
    this.props.addShape({
        name: "V1Engineering",
        vertices: (state) => {
          return Vicious1Vertices()
        },
        options: [],
      });

  }

  render() {

    let self = this;

    var shape_render = this.props.shapes.map( (shape) => {
      return <Shape
               key={shape.name}
               name={shape.name}
               active={shape.name === self.props.currentShape}
               options={shape.options}
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
                <Col sm={3}>
                  <FormControl type="number" value={this.props.x_offset} onChange={this.props.onOffsetXChange}/>
                </Col>
                <Col componentClass={ControlLabel} sm={1}>
                  X
                </Col>
                <Col sm={3}>
                  <FormControl type="number" value={this.props.y_offset} onChange={this.props.onOffsetYChange}/>
                </Col>
                <Col componentClass={ControlLabel} sm={1}>
                  Y
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
          <Panel className="options-panel">
            <Form horizontal>
              <FormGroup controlId="loop-count">
                <Col componentClass={ControlLabel} sm={4}>
                  Number of Loops
                </Col>
                <Col sm={8}>
                  <FormControl type="number" value={this.props.loops} onChange={this.props.changeLoops}/>
                </Col>
              </FormGroup>
            </Form>
          </Panel>
          <ListGroup>
            <ScaleTransform
              />
            <RotationTransform
              />
          </ListGroup>
        </Panel>
      </div>
    );
  }
}
Transforms = connect(transformsProps, transformsDispatch)(Transforms);


export default Transforms

