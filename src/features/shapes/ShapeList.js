import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Col,
  ControlLabel,
  Form,
  FormControl,
  FormGroup,
  ListGroup,
  Panel,
} from 'react-bootstrap'
import {
  setCurrentShape,
  setShapeStartingSize
} from './shapeSlice'
import { registeredShapes } from './registered_shapes.js'
import {
  setXFormOffsetX,
  setXFormOffsetY,
} from '../transforms/transformsSlice'
import Shape, { disableEnter } from './Shape'

const mapState = (state, ownProps) => {
  return {
    current_shape: state.shapes.current_shape,
    starting_size: state.shapes.starting_size,
    x_offset: state.transform.xformOffsetX,
    y_offset: state.transform.xformOffsetY,
  }
}

const mapDispatch = (dispatch, ownProps) => {
  return {
    setCurrentShape: (name) => {
      dispatch(setCurrentShape(name));
    },
    onSizeChange: (event) => {
      dispatch(setShapeStartingSize(event.target.value));
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
  render() {
    var shape_render = registeredShapes.map( (shape) => {
      let shapeInfo = shape.getInfo(this)
      return <Shape
               key={shapeInfo.name}
               name={shapeInfo.name}
               link={shapeInfo.link || ""}
               active={shapeInfo.name === this.props.current_shape}
               options={shapeInfo.options}
               clicked={ () => { this.props.setCurrentShape(shapeInfo.name); } } />
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
                  <FormControl type="number" value={this.props.starting_size} onChange={this.props.onSizeChange} onKeyDown={disableEnter}/>
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

export default connect(mapState, mapDispatch)(ShapeList);
