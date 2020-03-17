import React, { Component } from 'react'
import {
  Col,
  Form,
  FormControl,
  Accordion,
  Card,
  Row
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
        <Card className="p-3">
          <h4>Input Shapes</h4>
          <ShapeList />
        </Card>

        <Card className="mt-3 p-3">
          <h4>Modifiers</h4>
          <Row className="align-items-center pt-3 pb-2">
            <Col sm={4}>
              <Form.Label htmlFor="shape-size">
                Starting size
              </Form.Label>
            </Col>

            <Col sm={8}>
              <FormControl id="shape-size" type="number" value={this.props.starting_size} onChange={this.props.onSizeChange} onKeyDown={disableEnter} />
            </Col>
          </Row>

          <Row className="align-items-center pb-2">
            <Col sm={4}>
              <Form.Label htmlFor="shape-offset">
              Offset
              </Form.Label>
            </Col>

            <Col sm={8}>
              <div class="d-flex align-items-center">
                <span>X</span>
                <FormControl type="number" className="ml-2" value={this.props.x_offset} onChange={this.props.onOffsetXChange} onKeyDown={disableEnter} />
                <span className="ml-2">Y</span>
                <FormControl className="ml-2" type="number" value={this.props.y_offset} onChange={this.props.onOffsetYChange} onKeyDown={disableEnter} />
              </div>
            </Col>
          </Row>

          <Row className="align-items-center pb-2">
            <Col sm={4}>
              <Form.Label htmlFor="loop-count">
                Number of loops
              </Form.Label>
            </Col>

            <Col sm={8}>
              <FormControl id="loop-count" type="number" value={this.props.loops} onChange={this.props.changeLoops} onKeyDown={disableEnter} />
            </Col>
          </Row>

          <Accordion className="pt-4">
            <ScaleTransform />
            <RotationTransform />
            <TrackTransform />
          </Accordion>
        </Card>
      </div>
    )
  }
}

export default connect(mapState, mapDispatch)(Transforms)
