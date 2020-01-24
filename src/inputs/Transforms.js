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
import { Font2 } from './Fonts';
import { Vertex } from '../Geometry';
import { connect } from 'react-redux'

// Transform actions
export const addShape = ( shape ) => {
  return {
    type: 'ADD_SHAPE',
    shape: shape,
  };
}
export const setShape = ( shape ) => {
  return {
    type: 'SET_SHAPE',
    value: shape,
  };
}

export const setShapePolygonSides = ( sides ) => {
  return {
    type: 'SET_SHAPE_POLYGON_SIDES',
    value: sides,
  };
}

export const setShapeStarPoints = ( sides ) => {
  return {
    type: 'SET_SHAPE_STAR_POINTS',
    value: sides,
  };
}

export const setShapeStarRatio = ( value ) => {
  return {
    type: 'SET_SHAPE_STAR_RATIO',
    value: Math.min(Math.max(value, 0.0), 1.0),
  };
}

export const setShapeCircleLobes = ( sides ) => {
  return {
    type: 'SET_SHAPE_CIRCLE_LOBES',
    value: sides,
  };
}

export const setShapeReuleauxSides = ( sides ) => {
  return {
    type: 'SET_SHAPE_REULEAUX_SIDES',
    value: sides,
  };
}

export const setShapeepicycloidA = ( a ) => {
  return {
    type: 'SET_SHAPE_EPICYCLOID_A',
    value: a,
  };
}

export const setShapeepicycloidB = ( b ) => {
  return {
    type: 'SET_SHAPE_EPICYCLOID_B',
    value: b,
  };
}

export const setShapehypocycloidA = ( a ) => {
  return {
    type: 'SET_SHAPE_HYPOCYCLOID_A',
    value: a,
  };
}

export const setShapehypocycloidB = ( b ) => {
  return {
    type: 'SET_SHAPE_HYPOCYCLOID_B',
    value: b,
  };
}

export const setShapeRoseN = ( n ) => {
  return {
    type: 'SET_SHAPE_ROSE_N',
    value: n,
  };
}

export const setShapeRoseD = ( d ) => {
  return {
    type: 'SET_SHAPE_ROSE_D',
    value: d,
  };
}

export const setShapeInputText = ( text ) => {
  return {
    type: 'SET_SHAPE_INPUT_TEXT',
    value: text,
  };
}

export const setShapeSize = ( size ) => {
  return {
    type: 'SET_SHAPE_SIZE',
    value: size,
  };
}

export const setXFormOffsetX = ( offset ) => {
  return {
    type: 'SET_SHAPE_OFFSET_X',
    value: parseFloat(offset),
  };
}

export const setXFormOffsetY = ( offset ) => {
  return {
    type: 'SET_SHAPE_OFFSET_Y',
    value: parseFloat(offset),
  };
}

export const setLoops = ( loops ) => {
  return {
    type: 'SET_LOOPS',
    value: loops,
  };
}

export const toggleSpin = ( ) => {
  return {
    type: 'TOGGLE_SPIN',
  };
}

export const setSpin = ( value ) => {
  return {
    type: 'SET_SPIN',
    value: parseFloat(value),
  };
}

export const setSpinSwitchbacks = ( value ) => {
  return {
    type: 'SET_SPIN_SWITCHBACKS',
    value: parseInt(value),
  };
}

export const toggleGrow = ( ) => {
  return {
    type: 'TOGGLE_GROW',
  };
}

export const setGrow = ( value ) => {
  return {
    type: 'SET_GROW',
    value: value,
  };
}

export const toggleTrack = ( ) => {
  return {
    type: 'TOGGLE_TRACK',
  };
}

export const toggleTrackGrow = ( ) => {
  return {
    type: 'TOGGLE_TRACK_GROW',
  };
}

export const setTrack = ( value ) => {
  return {
    type: 'SET_TRACK',
    value: value,
  };
}

export const setTrackLength = ( value ) => {
  return {
    type: 'SET_TRACK_LENGTH',
    value: value,
  };
}

export const setTrackGrow = ( value ) => {
  return {
    type: 'SET_TRACK_GROW',
    value: value,
  };
}

const disableEnter = (event) => {
  if (event.key === 'Enter' && event.shiftKey === false) {
    event.preventDefault();
  }
};

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
                   }}
                   onKeyDown={disableEnter}/>
               </Col>
             </FormGroup>
    });

    var options_list_render = undefined;

    if (this.props.options.length >= 1) {
      options_list_render =
        <div className="shape-options">
          <Panel className="options-panel" collapsible expanded={this.props.active}>
            <Form horizontal>
              <p>{this.props.detail}</p>
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
    shapes: state.shapes.shapes,
    polygonSides: state.shapes.polygonSides,
    starPoints:   state.shapes.starPoints,
    starRatio:    state.shapes.starRatio,
    circleLobes:  state.shapes.circleLobes,
    reuleauxSides: state.shapes.reuleauxSides,
    epicycloidA: state.shapes.epicycloidA,
    epicycloidB: state.shapes.epicycloidB,
    hypocycloidA: state.shapes.hypocycloidA,
    hypocycloidB: state.shapes.hypocycloidB,
    roseN: state.shapes.roseN,
    roseD: state.shapes.roseD,
    inputText:    state.shapes.inputText,
    currentShape: state.shapes.currentShape,
    startingSize: state.shapes.startingSize,
    x_offset: state.transform.xformOffsetX,
    y_offset: state.transform.xformOffsetY,
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
    onReuleauxSidesChange: (event) => {
      dispatch(setShapeReuleauxSides(event.target.value));
    },
    onepicycloidAChange: (event) => {
      dispatch(setShapeepicycloidA(event.target.value));
    },
    onepicycloidBChange: (event) => {
      dispatch(setShapeepicycloidB(event.target.value));
    },
    onhypocycloidAChange: (event) => {
      dispatch(setShapehypocycloidA(event.target.value));
    },
    onhypocycloidBChange: (event) => {
      dispatch(setShapehypocycloidB(event.target.value));
    },
    onRoseNChange: (event) => {
      dispatch(setShapeRoseN(event.target.value));
    },
    onRoseDChange: (event) => {
      dispatch(setShapeRoseD(event.target.value));
    },
    onInputTextChange: (event) => {
      dispatch(setShapeInputText(event.target.value));
    },
    onSizeChange: (event) => {
      dispatch(setShapeSize(event.target.value));
    },
    onOffsetXChange: (event) => {
      dispatch(setXFormOffsetX(event.target.value));
    },
    onOffsetYChange: (event) => {
      dispatch(setXFormOffsetY(event.target.value));
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
          for (let i=0; i<state.shapes.polygonSides; i++) {
            let angle = Math.PI * 2.0 / state.shapes.polygonSides * (0.5 + i);
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
          for (let i=0; i<state.shapes.starPoints * 2; i++) {
            let angle = Math.PI * 2.0 / (2.0 * state.shapes.starPoints) * i;
            let star_scale = 1.0;
            if (i % 2 === 0) {
              star_scale *= state.shapes.starRatio;
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
            circle_points.push(Vertex(Math.cos(angle), Math.sin(state.shapes.circleLobes * angle)/state.shapes.circleLobes))
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
        name: "Heart",
        vertices: (state) => {
          let heart_points = []
          for (let i=0; i<128; i++) {
            let angle = Math.PI * 2.0 / 128.0 * i
            // heart equation from: http://mathworld.wolfram.com/HeartCurve.html
            heart_points.push(Vertex(1.0 * Math.pow(Math.sin(angle), 3),
                                     13.0/16.0 * Math.cos(angle) +
                                     -5.0/16.0 * Math.cos(2.0 * angle) +
                                     -2.0/16.0 * Math.cos(3.0 * angle) +
                                     -1.0/16.0 * Math.cos(4.0 * angle)))
          }
          return heart_points
        },
        options: [
        ],
      });
    this.props.addShape({
        name: "Reuleaux",
        vertices: (state) => {
          let points = []
          // Construct an equalateral triangle
          let corners = []
          // Initial location at PI/2
          let angle = Math.PI/2.0;
          // How much of the circle in one side?
          let coverageAngle = Math.PI/state.shapes.reuleauxSides;
          let halfCoverageAngle = 0.5 * coverageAngle;
          for (let c=0; c<state.shapes.reuleauxSides; c++) {
            let startAngle = angle + Math.PI - halfCoverageAngle;
            corners.push( [Vertex(Math.cos(angle), Math.sin(angle)), startAngle] );
            angle += 2.0 * Math.PI / state.shapes.reuleauxSides;
          }
          let length = 0.5 / Math.cos(Math.PI/2.0/state.shapes.reuleauxSides);
          for (let corn=0; corn < corners.length; corn++) {
            for (let i=0; i<128; i++) {
              let angle = coverageAngle  * (i / 128.0) + corners[corn][1];
              points.push(Vertex(length * corners[corn][0].x + Math.cos(angle),
                                 length * corners[corn][0].y + Math.sin(angle)));
            }
          }
          return points;
        },
        options: [
          {
            title: "Number of sides",
            value: () => { return this.props.reuleauxSides },
            onChange: this.props.onReuleauxSidesChange,
            step: 1,
          },
        ],
      });
    this.props.addShape(  {
        name: "Epicycloid",
        detail: "See http://mathworld.wolfram.com/Epicycloid.html for ideas",
        vertices: (state) => {
          let points = []
          let a = parseFloat(state.shapes.epicycloidA)
          let b = parseFloat(state.shapes.epicycloidB)

          for (let i=0; i<128; i++) {
            let angle = Math.PI * 2.0 / 128.0 * i
            points.push(Vertex(0.5 * (a + b) * Math.cos(angle) - 0.5 * b * Math.cos(((a + b) / b) * angle),
                               0.5 * (a + b) * Math.sin(angle) - 0.5 * b * Math.sin(((a + b) / b) * angle)))
          }
          return points
        },
        options: [
          {
            title: "Large circle radius",
            value: () => { return this.props.epicycloidA },
            onChange: this.props.onepicycloidAChange,
            step: 0.1,
          },
          {
            title: "Small circle radius",
            value: () => { return this.props.epicycloidB },
            onChange: this.props.onepicycloidBChange,
            step: 0.1,
          },
        ],
      });
      this.props.addShape(  {
          name: "Hypocycloid",
          detail: "See http://mathworld.wolfram.com/Hypocycloid.html for ideas",
          vertices: (state) => {
            let points = []
            let a = parseFloat(state.shapes.hypocycloidA)
            let b = parseFloat(state.shapes.hypocycloidB)

            for (let i=0; i<128; i++) {
              let angle = Math.PI * 2.0 / 128.0 * i
              points.push(Vertex(1.0 * (a - b) * Math.cos(angle) + b * Math.cos(((a - b) / b) * angle),
                                    1.0 * (a - b) * Math.sin(angle) - b * Math.sin(((a - b) / b) * angle)))
            }
            return points
          },
          options: [
            {
              title: "Large circle radius",
              value: () => { return this.props.hypocycloidA },
              onChange: this.props.onhypocycloidAChange,
              step: 0.1,
            },
            {
              title: "Small circle radius",
              value: () => { return this.props.hypocycloidB },
              onChange: this.props.onhypocycloidBChange,
              step: 0.1,
            },
          ],
        });
      this.props.addShape({
          name: "Rose",
          detail: "r=sin((n/d)*\u03B8) - See http://mathworld.wolfram.com/Rose.html for ideas",
          vertices: (state) => {
            let points = []
            let a = 2
            let n = parseInt(state.shapes.roseN)
            let d = parseInt(state.shapes.roseD)
            let p = (n * d % 2 === 0) ? 2 : 1
            let thetaClose = d * p * 32 * n;
            let resolution = 64 * n;

            for (let i=0; i<thetaClose+1; i++) {
              let theta = Math.PI * 2.0 / (resolution) * i
              let r = 0.5 * a * Math.sin((n / d) * theta)
              points.push(Vertex(r * Math.cos(theta), r * Math.sin(theta)))
            }
            return points
          },
          options: [
            {
              title: "Numerator",
              value: () => { return this.props.roseN },
              onChange: this.props.onRoseNChange,
              step: 1,
            },
            {
              title: "Denominator",
              value: () => { return this.props.roseD },
              onChange: this.props.onRoseDChange,
              step: 1,
            },
          ],
        });
    this.props.addShape({
        name: "Text",
        vertices: (state) => {
          let points = [];
          const under_y = -0.25;
          points.push(Vertex(0.0, under_y))
          let x = 0.0;
          for (let chi = 0; chi < state.shapes.inputText.length; chi++) {
            var letter = Font2(state.shapes.inputText[chi]);
            if (0 < letter.vertices.length) {
              points.push(Vertex(x + letter.vertices[0].x, under_y))
            }
            for (let vi = 0; vi < letter.vertices.length; vi++) {
              points.push(Vertex(letter.vertices[vi].x + x, letter.vertices[vi].y));
            }
            if (0 < letter.vertices.length) {
              points.push(Vertex(x + letter.vertices[letter.vertices.length-1].x, under_y))
            }
            if (chi !== state.shapes.inputText.length-1) {
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
               detail={shape.detail || ""}
               active={shape.name === self.props.currentShape}
               options={shape.options}
               clicked={ () => { self.props.setShape(shape.name); } }
             />
    });

    return (
      <div className="shapes">
        <ListGroup>
          {shape_render}
        </ListGroup>
        <div className="shoptions">
          <Panel className="options-panel" collapsible expanded>
            <Form horizontal>
              <FormGroup controlId="shape-size">
                <Col componentClass={ControlLabel} sm={4}>
                  Starting Size
                </Col>
                <Col sm={8}>
                  <FormControl type="number" value={this.props.startingSize} onChange={this.props.onSizeChange} onKeyDown={disableEnter}/>
                </Col>
              </FormGroup>
              <FormGroup controlId="shape-offset">
                <Col componentClass={ControlLabel} sm={4}>
                  Offset
                </Col>
                <Col componentClass={ControlLabel} sm={1}>
                  X
                </Col>
                <Col sm={3}>
                  <FormControl type="number" value={this.props.x_offset} onChange={this.props.onOffsetXChange} onKeyDown={disableEnter}/>
                </Col>
                <Col componentClass={ControlLabel} sm={1}>
                  Y
                </Col>
                <Col sm={3}>
                  <FormControl type="number" value={this.props.y_offset} onChange={this.props.onOffsetYChange} onKeyDown={disableEnter}/>
                </Col>
              </FormGroup>
            </Form>
          </Panel>
        </div>
      </div>
    )
  }
}

ShapeList = connect(shapeListProps, shapeListDispatch)(ShapeList) ;


const rotateProps = (state, ownProps) => {
  return {
    active: state.transform.spinEnabled,
    value: state.transform.spinValue,
    switchbacks: state.transform.spinSwitchbacks,
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
    onSwitchbacksChange: (event) => {
      dispatch(setSpinSwitchbacks(event.target.value));
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
                  Spin Step (Can be Negative)
                </Col>
                <Col sm={8}>
                  <FormControl type="number" step="0.1" value={this.props.value} onChange={this.props.onChange} onKeyDown={disableEnter}/>
                </Col>
              </FormGroup>
              <FormGroup controlId="rotate-switchbacks">
                <Col componentClass={ControlLabel} sm={4}>
                  Switchbacks
                </Col>
                <Col sm={8}>
                  <FormControl type="number" step="1" value={this.props.switchbacks} onChange={this.props.onSwitchbacksChange} onKeyDown={disableEnter}/>
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
    active: state.transform.growEnabled,
    value: state.transform.growValue,
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
                  <FormControl type="number" value={this.props.value} onChange={this.props.onChange} onKeyDown={disableEnter}/>
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

const trackProps = (state, ownProps) => {
  return {
    active: state.transform.trackEnabled,
    activeGrow: state.transform.trackGrowEnabled,
    value: state.transform.trackValue,
    length: state.transform.trackLength,
    trackGrow: state.transform.trackGrow,
  }
}

const trackDispatch = (dispatch, ownProps) => {
  return {
    activeCallback: () => {
      dispatch(toggleTrack());
    },
    activeGrowCallback: () => {
      dispatch(toggleTrackGrow());
    },
    onChange: (event) => {
      dispatch(setTrack(event.target.value));
    },
    onChangeLength: (event) => {
      dispatch(setTrackLength(event.target.value));
    },
    onChangeGrow: (event) => {
      dispatch(setTrackGrow(event.target.value));
    },
  }
}

class TrackTransform extends Component {

  render() {
    var activeClassName = "";
    if (this.props.active) {
      activeClassName = "active";
    }

    var activeGrowClassName = "";
    if (this.props.activeGrow) {
      activeGrowClassName = "active";
    }

    return (
      <div className="track">
        <ListGroupItem header="Track" className={activeClassName} onClick={this.props.activeCallback}>Moves the shape along a track (shown in green)</ListGroupItem>
        <div className="track-options">
          <Panel className="options-panel" collapsible expanded={this.props.active}>
            <Form horizontal>
              <FormGroup controlId="track-size">
                <Col componentClass={ControlLabel} sm={4}>
                  Track Size
                </Col>
                <Col sm={8}>
                  <FormControl type="number" value={this.props.value} onChange={this.props.onChange} onKeyDown={disableEnter}/>
                </Col>
              </FormGroup>
              <FormGroup controlId="track-length">
                <Col componentClass={ControlLabel} sm={4}>
                  Track Length
                </Col>
                <Col sm={8}>
                  <FormControl type="number" value={this.props.length} step="0.05" onChange={this.props.onChangeLength} onKeyDown={disableEnter}/>
                </Col>
              </FormGroup>
              <ListGroupItem header="Grow" className={activeGrowClassName} onClick={this.props.activeGrowCallback}>Grows or shrinks the track a little bit for each step</ListGroupItem>
              <div className="scale-options">
                <Panel className="options-panel" collapsible expanded={this.props.activeGrow}>
                    <FormGroup controlId="scale-step">
                      <Col componentClass={ControlLabel} sm={4}>
                        Track Grow Step
                      </Col>
                      <Col sm={8}>
                        <FormControl type="number" value={this.props.trackGrow} onChange={this.props.onChangeGrow} onKeyDown={disableEnter}/>
                      </Col>
                    </FormGroup>
                </Panel>
              </div>
            </Form>
          </Panel>
        </div>
      </div>
    )
  }
}
TrackTransform = connect(trackProps, trackDispatch)(TrackTransform) ;

const transformsProps = (state, ownProps) => {
  return {
    loops: state.transform.numLoops,
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
                  <FormControl type="number" value={this.props.loops} onChange={this.props.changeLoops} onKeyDown={disableEnter}/>
                </Col>
              </FormGroup>
            </Form>
          </Panel>
          <ListGroup>
            <ScaleTransform
              />
            <RotationTransform
              />
            <TrackTransform
              />
          </ListGroup>
        </Panel>
      </div>
    );
  }
}
Transforms = connect(transformsProps, transformsDispatch)(Transforms);


export default Transforms
