import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
    Accordion,
    Card,
    Col,
    Form,
    FormControl,
    Row,
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

const mapStateToProps = (state, ownProps) => {
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

const mapDispatchToProps = (dispatch, ownProps) => {
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
      <Card className={`${activeClassName} overflow-auto`}>
        <Accordion.Toggle as={Card.Header} eventKey={0} onClick={this.props.activeCallback}>
          <h4>Rectangular Machine</h4>
          Rectangular machines like Zen XY
        </Accordion.Toggle>

        <Accordion.Collapse eventKey={0}>
          <Card.Body>
            <Row className="align-items-center pb-2">
              <Col sm={4}>
                <Form.Label htmlFor="min_x">
                  Min X (mm)
                </Form.Label>
              </Col>

              <Col sm={8}>
                <FormControl id="min_x" type="number" value={this.props.min_x} onChange={this.props.onMinXChange} />
              </Col>
            </Row>

            <Row className="align-items-center pb-2">
              <Col sm={4}>
                <Form.Label htmlFor="max_x">
                  Max X (mm)
                </Form.Label>
              </Col>

              <Col sm={8}>
                <FormControl id="max_x" type="number" value={this.props.max_x} onChange={this.props.onMaxXChange} />
              </Col>
            </Row>

            <Row className="align-items-center pb-2">
              <Col sm={4}>
                <Form.Label htmlFor="min_y">
                  Min Y (mm)
                </Form.Label>
              </Col>

              <Col sm={8}>
                <FormControl id="min_y" type="number" value={this.props.min_y} onChange={this.props.onMinYChange} />
              </Col>
            </Row>

            <Row className="align-items-center pb-2">
              <Col sm={4}>
                <Form.Label htmlFor="max_y">
                  Max Y (mm)
                </Form.Label>
              </Col>

              <Col sm={8}>
                <FormControl id="max_y" type="number" value={this.props.max_y} onChange={this.props.onMaxYChange} />
              </Col>
            </Row>

            <Row className="align-items-center pb-2">
              <Col sm={4}>
                <Form.Label htmlFor="origin">
                  Force origin
                </Form.Label>
              </Col>

              <Col sm={8}>
                <ToggleButtonGroup id="origin-bar" type="checkbox" name="origin" value={this.props.origin} onChange={this.props.onOriginChange}>
                  <ToggleButton variant="light" value={0} >Lower Left</ToggleButton>
                  <ToggleButton variant="light" value={1} >Upper Left</ToggleButton>
                  <ToggleButton variant="light" value={2} >Upper Right</ToggleButton>
                  <ToggleButton variant="light" value={3} >Lower Right</ToggleButton>
                </ToggleButtonGroup>
              </Col>
            </Row>
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(RectSettings)
