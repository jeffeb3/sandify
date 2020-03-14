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
  registeredShapes,
  setCurrentShape,
  setShapeStartingSize,
  addShape
} from './shapesSlice'
import {
  setXFormOffsetX,
  setXFormOffsetY,
} from '../transforms/transformsSlice'
import Shape, { disableEnter } from './Shape'

const mapState = (state, ownProps) => {
  let props = {
    shapes: state.shapes.shapes,
    current_shape: state.shapes.current_shape,
    starting_size: state.shapes.starting_size,
    x_offset: state.transform.xformOffsetX,
    y_offset: state.transform.xformOffsetY,
  };
  let registeredProps = registeredShapes.map((shape) => shape.mapStateToProps(state, ownProps));

  return Object.assign(props, ...registeredProps);
}

const mapDispatch = (dispatch, ownProps) => {
  let methods = {
    addShape: (shape) => {
      dispatch(addShape(shape));
    },
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
               active={shape.name === self.props.current_shape}
               options={shape.options}
               clicked={ () => { self.props.setCurrentShape(shape.name); } }
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
