import React, { Component } from 'react';
import {
    Col,
    ControlLabel,
    Form,
    FormControl,
    FormGroup,
    ListGroup,
    ListGroupItem,
    Panel,
    ToggleButton,
    ToggleButtonGroup,
} from 'react-bootstrap'
import { connect } from 'react-redux'

import './MachineSettings.css';

// Machine actions
export const toggleMachineRectExpanded = ( ) => {
  localStorage.setItem('machine_rect_active', 1)
  return {
    type: 'TOGGLE_MACHINE_RECT_EXPANDED',
  };
}

export const toggleMachinePolarExpanded = ( ) => {
  localStorage.setItem('machine_rect_active', 2)
  return {
    type: 'TOGGLE_MACHINE_POLAR_EXPANDED',
  };
}

export const toggleMachineEndpoints = ( ) => {
  return {
    type: 'TOGGLE_MACHINE_ENDPOINTS',
  };
}

export const setMachineRectOrigin = (value) => {
  return {
    type: 'SET_MACHINE_RECT_ORIGIN',
    value: value,
  };
}

export const setMachineMinX = ( value ) => {
  // This is definitely a side effect...
  localStorage.setItem('machine_min_x', value)
  return {
    type: 'SET_MIN_X',
    value: value,
  };
}

export const setMachineMaxX = ( value ) => {
  localStorage.setItem('machine_max_x', value)
  return {
    type: 'SET_MAX_X',
    value: value,
  };
}

export const setMachineMinY = ( value ) => {
  localStorage.setItem('machine_min_y', value)
  return {
    type: 'SET_MIN_Y',
    value: value,
  };
}

export const setMachineMaxY = ( value ) => {
  localStorage.setItem('machine_max_y', value)
  return {
    type: 'SET_MAX_Y',
    value: value,
  };
}

export const setMachineRadius = ( value ) => {
  localStorage.setItem('machine_radius', value)
  return {
    type: 'SET_MAX_RADIUS',
    value: value,
  };
}

const rectMapStateToProps = (state, ownProps) => {
  return {
    expanded: state.app.machineRectExpanded,
    active:   state.machine.rectangular,
    min_x:    state.machine.min_x,
    max_x:    state.machine.max_x,
    min_y:    state.machine.min_y,
    max_y:    state.machine.max_y,
    origin:   state.machine.rectOrigin,
  }
}

const rectMapDispatchToProps = (dispatch, ownProps) => {
  return {
    activeCallback: (event) => {
      dispatch(toggleMachineRectExpanded())
    },
    onMinXChange: (event) => {
      dispatch(setMachineMinX(parseFloat(event.target.value)))
    },
    onMaxXChange: (event) => {
      dispatch(setMachineMaxX(parseFloat(event.target.value)))
    },
    onMinYChange: (event) => {
      dispatch(setMachineMinY(parseFloat(event.target.value)))
    },
    onMaxYChange: (event) => {
      dispatch(setMachineMaxY(parseFloat(event.target.value)))
    },
    onOriginChange: (value) => {
      dispatch(setMachineRectOrigin(value))
    },
  }
}

class RectSettings extends Component {
  render() {
    var activeClassName = "";
    if (this.props.active) {
      activeClassName = "active";
    }

    return (
      <div className="rect">
        <ListGroupItem header="Rectangular Machine" className={activeClassName} onClick={this.props.activeCallback}>Rectangle Machines like the Zen XY.</ListGroupItem>
        <div className="rect-options">
          <Panel className="options-panel" collapsible expanded={this.props.expanded}>
            <Form horizontal>
              <FormGroup className="machineSmaller" controlId="min_x">
                <Col className="machineSmaller" componentClass={ControlLabel} sm={2}>
                  Min X (mm)
                </Col>
                <Col sm={8} smOffset={1}>
                  <FormControl type="number" value={this.props.min_x} onChange={this.props.onMinXChange}/>
                </Col>
              </FormGroup>
              <FormGroup className="machineSmaller" controlId="max_x">
                <Col className="machineSmaller" componentClass={ControlLabel} sm={2}>
                  Max X (mm)
                </Col>
                <Col sm={8} smOffset={1}>
                  <FormControl type="number" value={this.props.max_x} onChange={this.props.onMaxXChange}/>
                </Col>
              </FormGroup>
              <FormGroup className="machineSmaller" controlId="min_y">
                <Col className="machineSmaller" componentClass={ControlLabel} sm={2}>
                  Min Y (mm)
                </Col>
                <Col sm={8} smOffset={1}>
                  <FormControl type="number" value={this.props.min_y} onChange={this.props.onMinYChange}/>
                </Col>
              </FormGroup>
              <FormGroup className="machineSmaller" controlId="max_y">
                <Col className="machineSmaller" componentClass={ControlLabel} sm={2}>
                  Max Y (mm)
                </Col>
                <Col sm={8} smOffset={1}>
                  <FormControl type="number" value={this.props.max_y} onChange={this.props.onMaxYChange}/>
                </Col>
              </FormGroup>
              <FormGroup className="machineSmaller" controlId="max_y">
                <Col className="machineSmaller" componentClass={ControlLabel} sm={2}>
                  Force Origin
                </Col>
                <Col componentClass={ControlLabel} sm={8} smOffset={1}>
                  <ToggleButtonGroup id="origin-bar" type="checkbox" name="origin" value={this.props.origin} onChange={this.props.onOriginChange}>
                    <ToggleButton value={0} >Lower Left</ToggleButton>
                    <ToggleButton value={1} >Upper Left</ToggleButton>
                    <ToggleButton value={2} >Upper Right</ToggleButton>
                    <ToggleButton value={3} >Lower Right</ToggleButton>
                  </ToggleButtonGroup>
                </Col>
              </FormGroup>
            </Form>
          </Panel>
        </div>
      </div>
    )
  }
}

RectSettings = connect(rectMapStateToProps, rectMapDispatchToProps)(RectSettings)

const polarMapStateToProps = (state, ownProps) => {
  return {
    expanded:   state.app.machinePolarExpanded,
    active:     !state.machine.rectangular,
    max_radius: state.machine.max_radius,
    endpoints:  state.machine.polarEndpoints,
  }
}

const polarMapDispatchToProps = (dispatch, ownProps) => {
  return {
    activeCallback: (event) => {
      dispatch(toggleMachinePolarExpanded())
    },
    onMaxRadiusChange: (event) => {
      dispatch(setMachineRadius(parseFloat(event.target.value)))
    },
    toggleEndpoints: () => {
      dispatch(toggleMachineEndpoints());
    },
  }
}

class PolarSettings extends Component {
  render() {
    var activeClassName = "";
    if (this.props.active) {
      activeClassName = "active";
    }

    const endpointsActiveClass = (this.props.endpoints ? "active" : null);

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

PolarSettings = connect(polarMapStateToProps, polarMapDispatchToProps)(PolarSettings)

class MachineSettings extends Component {
  render() {

    return (
      <div className="machine-form">
        <Panel className="machine-panel">
          <h4>Machine Settings</h4>
          <ListGroup>
            <RectSettings/>
            <PolarSettings/>
          </ListGroup>
        </Panel>
      </div>
    )
  }
}

export default MachineSettings;

