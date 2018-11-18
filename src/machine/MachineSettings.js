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
} from 'react-bootstrap'
import { connect } from 'react-redux'

import {
  setMachineMinX,
  setMachineMaxX,
  setMachineMinY,
  setMachineMaxY,
  setMachineRadius,
  toggleMachineRectExpanded,
  toggleMachinePolarExpanded,
  toggleMachineEndpoints,
} from '../reducers/Index.js';
import './MachineSettings.css';


const rectMapStateToProps = (state, ownProps) => {
  return {
    active:   state.machineRectActive,
    expanded: state.machineRectExpanded,
    min_x:    state.min_x,
    max_x:    state.max_x,
    min_y:    state.min_y,
    max_y:    state.max_y,
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
    }
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
                <Col className="machineSmaller" componentClass={ControlLabel} sm={3}>
                  Min X (mm)
                </Col>
                <Col sm={7} smOffset={1}>
                  <FormControl type="number" value={this.props.min_x} onChange={this.props.onMinXChange}/>
                </Col>
              </FormGroup>
              <FormGroup className="machineSmaller" controlId="max_x">
                <Col className="machineSmaller" componentClass={ControlLabel} sm={3}>
                  Max X (mm)
                </Col>
                <Col sm={7} smOffset={1}>
                  <FormControl type="number" value={this.props.max_x} onChange={this.props.onMaxXChange}/>
                </Col>
              </FormGroup>
              <FormGroup className="machineSmaller" controlId="min_y">
                <Col className="machineSmaller" componentClass={ControlLabel} sm={3}>
                  Min Y (mm)
                </Col>
                <Col sm={7} smOffset={1}>
                  <FormControl type="number" value={this.props.min_y} onChange={this.props.onMinYChange}/>
                </Col>
              </FormGroup>
              <FormGroup className="machineSmaller" controlId="max_y">
                <Col className="machineSmaller" componentClass={ControlLabel} sm={3}>
                  Max Y (mm)
                </Col>
                <Col sm={7} smOffset={1}>
                  <FormControl type="number" value={this.props.max_y} onChange={this.props.onMaxYChange}/>
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
    active:   state.machinePolarActive,
    expanded: state.machinePolarExpanded,
    max_radius:    state.max_radius,
    endpoints: state.machineEndpoints,
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

