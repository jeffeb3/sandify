import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
    Col,
    ControlLabel,
    Form,
    FormControl,
    FormGroup,
    ListGroupItem,
    Panel,
    ToggleButton,
    ToggleButtonGroup,
} from 'react-bootstrap'
import {
  toggleMachineRectExpanded,
  setMachineMinX,
  setMachineMaxX,
  setMachineMinY,
  setMachineMaxY,
  setMachineRectOrigin } from './machineSlice'

const mapState = (state, ownProps) => {
  return {
    expanded: state.machine.rect_expanded,
    active:   state.machine.rectangular,
    min_x:    state.machine.min_x,
    max_x:    state.machine.max_x,
    min_y:    state.machine.min_y,
    max_y:    state.machine.max_y,
    origin:   state.machine.rect_origin,
  }
}

const mapDispatch = (dispatch, ownProps) => {
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
    var activeClassName = this.props.active ? 'active' : ''

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

export default connect(mapState, mapDispatch)(RectSettings)
