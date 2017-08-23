import React, { Component } from 'react';
import {
    Col,
    ControlLabel,
    Form,
    FormControl,
    FormGroup,
    Panel,
} from 'react-bootstrap'
import { connect } from 'react-redux'
import {
  setWiperAngleDeg,
  setWiperSize,
} from '../reducers/Index.js';

const wiperProps = (state, ownProps) => {
  return {
    angle: state.wiperAngleDeg,
    size: state.wiperSize,
  }
}

const wiperDispatch = (dispatch, ownProps) => {
  return {
    changeAngle: (event) => {
      dispatch(setWiperAngleDeg(parseFloat(event.target.value)));
    },
    changeSize: (event) => {
      dispatch(setWiperSize(parseFloat(event.target.value)));
    },
  }
}

class Wiper extends Component {

  render() {

    return (
      <div className="Wiper">
        <Panel className="Wiper-panel">
          <h4>Wipe Settings</h4>
          <Form horizontal>
            <FormGroup controlId="angle">
              <Col componentClass={ControlLabel} sm={4}>
                Wiper Angle
              </Col>
              <Col sm={8}>
                <FormControl type="number" min="0" max="180" step="0.5" value={this.props.angle} onChange={this.props.changeAngle}/>
              </Col>
            </FormGroup>
            <FormGroup controlId="size">
              <Col componentClass={ControlLabel} sm={4}>
                Wiper Size
              </Col>
              <Col sm={8}>
                <FormControl type="number" step="0.1" value={this.props.size} onChange={this.props.changeSize}/>
              </Col>
            </FormGroup>
          </Form>
        </Panel>
      </div>
    );
  }
}
Wiper = connect(wiperProps, wiperDispatch)(Wiper);

export default Wiper

