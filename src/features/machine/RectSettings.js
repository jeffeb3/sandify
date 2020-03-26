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
    expanded: state.machine.rectExpanded,
    active:   state.machine.rectangular,
    minX:    state.machine.minX,
    maxX:    state.machine.maxX,
    minY:    state.machine.minY,
    maxY:    state.machine.maxY,
    origin:   state.machine.rectOrigin,
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
          <h4>Rectangular machine</h4>
          Rectangular machines like Zen XY
        </Accordion.Toggle>

        <Accordion.Collapse eventKey={0}>
          <Card.Body>
            <Row className="align-items-center pb-2">
              <Col sm={4}>
                <Form.Label htmlFor="minX">
                  Min X (mm)
                </Form.Label>
              </Col>

              <Col sm={8}>
                <FormControl id="minX" type="number" value={this.props.minX} onChange={this.props.onMinXChange} />
              </Col>
            </Row>

            <Row className="align-items-center pb-2">
              <Col sm={4}>
                <Form.Label htmlFor="maxX">
                  Max X (mm)
                </Form.Label>
              </Col>

              <Col sm={8}>
                <FormControl id="maxX" type="number" value={this.props.maxX} onChange={this.props.onMaxXChange} />
              </Col>
            </Row>

            <Row className="align-items-center pb-2">
              <Col sm={4}>
                <Form.Label htmlFor="minY">
                  Min Y (mm)
                </Form.Label>
              </Col>

              <Col sm={8}>
                <FormControl id="minY" type="number" value={this.props.minY} onChange={this.props.onMinYChange} />
              </Col>
            </Row>

            <Row className="align-items-center pb-2">
              <Col sm={4}>
                <Form.Label htmlFor="maxY">
                  Max Y (mm)
                </Form.Label>
              </Col>

              <Col sm={8}>
                <FormControl id="maxY" type="number" value={this.props.maxY} onChange={this.props.onMaxYChange} />
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
