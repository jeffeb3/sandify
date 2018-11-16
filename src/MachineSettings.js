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
  setMachineMinX,
  setMachineMaxX,
  setMachineMinY,
  setMachineMaxY,
} from './reducers/Index.js';
import './MachineSettings.css';


const mapStateToProps = (state, ownProps) => {
  return {
    min_x: state.min_x,
    max_x: state.max_x,
    min_y: state.min_y,
    max_y: state.max_y,
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
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

class MachineSettings extends Component {
  render() {
    return (
      <div className="machine-form">
        <Panel>
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
    )
  }
}

MachineSettings = connect(mapStateToProps, mapDispatchToProps)(MachineSettings)

export default MachineSettings;

