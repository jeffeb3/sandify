import React, { Component } from 'react'
import {
  Col,
  ControlLabel,
  Form,
  FormControl,
  FormGroup,
  ListGroup,
  Panel,
} from 'react-bootstrap'
import { connect } from 'react-redux'
import { disableEnter } from '../shapes/Shape'
import ShapeList from '../shapes/ShapeList'
import {
  setShapeStartingSize,
  setNumLoops,
  setXFormOffsetX,
  setXFormOffsetY,
} from './transformsSlice'
import ScaleTransform from './ScaleTransform'
import RotationTransform from './RotationTransform'
import TrackTransform from './TrackTransform'
import './Transforms.css'

const mapState = (state, ownProps) => {
  return {
    loops: state.transform.numLoops,
    starting_size: state.transform.starting_size,
    x_offset: state.transform.xformOffsetX,
    y_offset: state.transform.xformOffsetY,
  }
}

const mapDispatch = (dispatch, ownProps) => {
  return {
    changeLoops: (event) => {
      dispatch(setNumLoops(event.target.value));
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
            <ScaleTransform />
            <RotationTransform />
            <TrackTransform />
          </ListGroup>
        </Panel>
      </div>
    );
  }
}

export default connect(mapState, mapDispatch)(Transforms)
