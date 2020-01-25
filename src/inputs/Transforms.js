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
import { Vertex } from '../Geometry';
import { connect } from 'react-redux';

import { Polygon } from '../shapes/Polygon.js';
import { Star } from '../shapes/Star.js';
import { Circle } from '../shapes/Circle.js';
import { Heart } from '../shapes/Heart.js';
import { Reuleaux } from '../shapes/Reuleaux.js';
import { Epicycloid } from '../shapes/Epicycloid.js';
import { Hypocycloid } from '../shapes/Hypocycloid.js';
import { Rose } from '../shapes/Rose.js';
import { InputText } from '../shapes/InputText.js';
import { V1Engineering } from '../shapes/V1Engineering.js';

export const registeredShapes = [Polygon, Star, Circle, Heart, Reuleaux, Epicycloid,
  Hypocycloid, Rose, InputText, V1Engineering];

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
              <p>See <a target="_blank" rel="noopener noreferrer" href={this.props.link}>{this.props.link}</a> for ideas</p>
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
  let props = {
    shapes: state.shapes.shapes,
    currentShape: state.shapes.currentShape,
    startingSize: state.shapes.startingSize,
    x_offset: state.transform.xformOffsetX,
    y_offset: state.transform.xformOffsetY,
  };
  let registeredProps = registeredShapes.map((shape) => shape.mapStateToProps(state, ownProps));

  return Object.assign(props, ...registeredProps);
}

const shapeListDispatch = (dispatch, ownProps) => {
  let methods = {
    addShape: (shape) => {
      dispatch(addShape(shape));
    },
    setShape: (name) => {
      dispatch(setShape(name));
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
  };
  let registeredMethods = registeredShapes.map((shape) => shape.mapDispatchToProps(dispatch, ownProps));

  return Object.assign(methods, ...registeredMethods);
}

class ShapeList extends Component {
  constructor(props) {
    super(props)

    registeredShapes.forEach((shape) => {
      this.props.addShape(shape.getParams(this));
    });
  }

  render() {
    let self = this;

    var shape_render = this.props.shapes.map( (shape) => {
      return <Shape
               key={shape.name}
               name={shape.name}
               link={shape.link || ""}
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
