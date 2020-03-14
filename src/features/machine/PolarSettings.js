import React, { Component } from 'react';
import {
    Col,
    ControlLabel,
    Form,
    FormControl,
    FormGroup,
    ListGroupItem,
    Panel
} from 'react-bootstrap'
import { connect } from 'react-redux'
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
      <div className="polar">
        <ListGroupItem header="Polar Machine" className={activeClassName} onClick={this.props.activeCallback}>Polar Machines like the Sisyphus.</ListGroupItem>
        <div className="polar-options">
          <Panel className="options-panel" collapsible expanded={this.props.expanded}>
            <Form horizontal>
              <FormGroup className="machineSmaller" controlId="max_radius">
                <Col className="machineSmaller" componentClass={ControlLabel} sm={3}>
                  Max Radius (mm)
                </Col>
                <Col sm={7} smOffset={1}>
                  <FormControl type="number" value={this.props.max_radius} onChange={this.props.onMaxRadiusChange}/>
                </Col>
              </FormGroup>
            </Form>
            <ListGroupItem header="Force Endpoints" className={endpointsActiveClass} onClick={this.props.toggleEndpoints}>Forces the first and last points to be at the center and edge.</ListGroupItem>
          </Panel>
        </div>
      </div>
    )
  }
}

export default connect(mapState, mapDispatch)(PolarSettings)
