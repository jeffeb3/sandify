import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
    Accordion,
    Col,
    Row,
    Form,
    Card
} from 'react-bootstrap'
import {
  toggleMachinePolarExpanded,
  setMachineMaxRadius,
  toggleMachineEndpoints,
} from './machineSlice'

const mapState = (state, ownProps) => {
  return {
    expanded:   state.machine.polar_expanded,
    active:     !state.machine.rectangular,
    max_radius: state.machine.max_radius,
    endpoints:  state.machine.polar_endpoints,
  }
}

const mapDispatch = (dispatch, ownProps) => {
  return {
    activeCallback: (event) => {
      dispatch(toggleMachinePolarExpanded())
    },
    onMaxRadiusChange: (event) => {
      dispatch(setMachineMaxRadius(parseFloat(event.target.value)))
    },
    toggleEndpoints: () => {
      dispatch(toggleMachineEndpoints());
    },
  }
}

class PolarSettings extends Component {
  render() {
    var activeClassName = this.props.active ? 'active' : ''
    var endpointsActiveClass = this.props.endpoints ? 'active' : null

    return (
      <Card className={`${activeClassName} overflow-auto`}>
        <Accordion.Toggle as={Card.Header} eventKey={1} onClick={this.props.activeCallback}>
          <h4>Polar Machine</h4>
          Polar Machines like the Sisyphus
        </Accordion.Toggle>
        
        <Accordion.Collapse eventKey={1}>
          <Card.Body>
            <Row className="align-items-center pb-2">
              <Col sm={4}>
                <Form.Label htmlFor="max_radius">
                  Max Radius (mm)
                </Form.Label>
              </Col>
              <Col sm={8}>
                <Form.Control id="max_radius" type="number" value={this.props.max_radius} onChange={this.props.onMaxRadiusChange} />
              </Col>
            </Row>

            <Accordion>
              <Card className={`${endpointsActiveClass} overflow-auto`}>
                <Accordion.Toggle as={Card.Header} eventKey={0} onClick={this.props.toggleEndpoints}>
                  <h4>Force Endpoints</h4>
                  Forces the first and last points to be at the center and edge
                </Accordion.Toggle>
              </Card>
            </Accordion>
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    )
  }
}

export default connect(mapState, mapDispatch)(PolarSettings)
