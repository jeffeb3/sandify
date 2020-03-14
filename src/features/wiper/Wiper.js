import React, { Component } from 'react';
import { connect } from 'react-redux'
import {
    Col,
    ControlLabel,
    Form,
    FormControl,
    FormGroup,
    Panel,
} from 'react-bootstrap'
import {
  setWiperAngleDeg,
  setWiperSize
} from './wiperSlice'

const mapState = (state, ownProps) => {
  return {
    angle_deg: state.wiper.angle_deg,
    size: state.wiper.size,
  }
}

const mapDispatch = (dispatch, ownProps) => {
  return {
    changeAngle: (event) => {
      dispatch(setWiperAngleDeg(parseFloat(event.target.value)))
    },
    changeSize: (event) => {
      dispatch(setWiperSize(parseFloat(event.target.value)))
    },
  }
}

class Wiper extends Component {
  render() {
    return (
      <div className="Wiper">
        <Panel className="Wiper-panel">
          <h4>Wipe Settings</h4>
          <Panel className="Wiper-panel">
            <Form horizontal>
              <FormGroup controlId="angle">
                <Col componentClass={ControlLabel} sm={4}>
                  Wiper Angle
                </Col>
                <Col sm={8}>
                  <FormControl type="number" min="0" max="180" step="0.5" value={this.props.angle_deg} onChange={this.props.changeAngle}/>
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
        </Panel>
      </div>
    );
  }
}

Wiper = connect(mapState, mapDispatch)(Wiper)
export default Wiper
