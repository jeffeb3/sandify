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

const mapStateToProps = (state, ownProps) => {
  return {
    expanded:   state.machine.polarExpanded,
    active:     !state.machine.rectangular,
    maxRadius: state.machine.maxRadius,
    endpoints:  state.machine.polarEndpoints,
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
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
          <h4>Polar machine</h4>
          Polar machines like Sisyphus
        </Accordion.Toggle>

        <Accordion.Collapse eventKey={1}>
          <Card.Body>
            <Row className="align-items-center pb-2">
              <Col sm={4}>
                <Form.Label htmlFor="maxRadius">
                  Max radius (mm)
                </Form.Label>
              </Col>
              <Col sm={8}>
                <Form.Control id="maxRadius" type="number" value={this.props.maxRadius} onChange={this.props.onMaxRadiusChange} />
              </Col>
            </Row>

            <Accordion>
              <Card className={`${endpointsActiveClass} overflow-auto`}>
                <Accordion.Toggle as={Card.Header} eventKey={0} onClick={this.props.toggleEndpoints}>
                  <h4>Force endpoints</h4>
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

export default connect(mapStateToProps, mapDispatchToProps)(PolarSettings)
