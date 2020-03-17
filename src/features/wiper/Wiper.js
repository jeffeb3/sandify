import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
    Col,
    Row,
    Form,
    FormControl,
    Card,
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
      <div className="wiper">
        <Card className="p-3">
          <h4>Wiper Settings</h4>
          <Row className="align-items-center pt-3 pb-2">
            <Col sm={4}>
              <Form.Label htmlFor="angle">
                Wiper Angle
              </Form.Label>
            </Col>
            <Col sm={8}>
              <FormControl id="angle" type="number" min="0" max="180" step="0.5" value={this.props.angle_deg} onChange={this.props.changeAngle} />
            </Col>
          </Row>

          <Row className="align-items-center pb-2">
            <Col sm={4}>
              <Form.Label htmlFor="size">
                Wiper Size
              </Form.Label>
            </Col>
            <Col sm={8}>
              <FormControl id="size" type="number" step="0.1" value={this.props.size} onChange={this.props.changeSize} />
            </Col>
          </Row>
        </Card>
      </div>
    );
  }
}

Wiper = connect(mapState, mapDispatch)(Wiper)
export default Wiper
