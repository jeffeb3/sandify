import React, { Component } from 'react'
import {
  Accordion,
  Col,
  Row,
  Form,
  Card,
} from 'react-bootstrap'
import { connect } from 'react-redux'
import { disableEnter } from '../shapes/Shape'
import {
  toggleSpin,
  setSpin,
  setSpinSwitchbacks,
} from './transformsSlice'

const mapState = (state, ownProps) => {
  return {
    active: state.transform.spin_enabled,
    value: state.transform.spin_value,
    switchbacks: state.transform.spin_switchbacks,
  }
}

const mapDispatch = (dispatch, ownProps) => {
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
    var activeClassName = this.props.active ? 'active' : ''
    var activeKey = this.props.active ? 0 : null

    return (
      <Accordion defaultActiveKey={activeKey}>
        <Card className={`${activeClassName} overflow-auto`}>
          <Accordion.Toggle as={Card.Header} eventKey={0} onClick={this.props.activeCallback}>
            <h4>Spin</h4>
            Spins the shape a little bit for each copy
          </Accordion.Toggle>

          <Accordion.Collapse eventKey={0}>
            <Card.Body>
              <Row className="align-items-center pb-2">
                <Col sm={4}>
                  <Form.Label htmlFor="rotate-step">
                    Spin step (can be negative)
                  </Form.Label>
                </Col>

                <Col sm={8}>
                  <Form.Control id="rotate-step" type="number" step="0.1" value={this.props.value} onChange={this.props.onChange} onKeyDown={disableEnter} />
                </Col>
              </Row>

              <Row className="align-items-center pb-2">
                <Col sm={4}>
                  <Form.Label htmlFor="rotate-switchbacks">
                    Switchbacks
                  </Form.Label>
                </Col>

                <Col sm={8}>
                  <Form.Control id="rotate-switchbacks" type="number" step="1" value={this.props.switchbacks} onChange={this.props.onSwitchbacksChange} onKeyDown={disableEnter} />
                </Col>
              </Row>
            </Card.Body>
          </Accordion.Collapse>
        </Card>
      </Accordion>
    )
  }
}

export default connect(mapState, mapDispatch)(RotationTransform)
