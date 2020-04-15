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
import Switch from 'react-switch'
import {
  updateMachine,
  toggleMinimizeMoves,
  toggleMachineRectExpanded,
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
    minimizeMoves: state.machine.minimizeMoves
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    activeCallback: (event) => {
      dispatch(toggleMachineRectExpanded())
    },
    onMinXChange: (event) => {
      dispatch(updateMachine({minX: parseFloat(event.target.value)}))
    },
    onMaxXChange: (event) => {
      dispatch(updateMachine({maxX: parseFloat(event.target.value)}))
    },
    onMinYChange: (event) => {
      dispatch(updateMachine({minY: parseFloat(event.target.value)}))
    },
    onMaxYChange: (event) => {
      dispatch(updateMachine({maxY: parseFloat(event.target.value)}))
    },
    onOriginChange: (value) => {
      dispatch(setMachineRectOrigin(value))
    },
    toggleMinimizeMoves: () => {
      dispatch(toggleMinimizeMoves());
    },
  }
}

class RectSettings extends Component {
  render() {
    var activeClassName = this.props.active ? 'active' : ''

    return (
      <Card className={`${activeClassName} overflow-auto`}>
        <Accordion.Toggle as={Card.Header} eventKey={0} onClick={this.props.activeCallback}>
          <h3>Rectangular machine</h3>
          Rectangular machines like Zen XY
        </Accordion.Toggle>

        <Accordion.Collapse eventKey={0}>
          <Card.Body>
            <Row className="align-items-center pb-2">
              <Col sm={5}>
                <Form.Label htmlFor="minX">
                  Min X (mm)
                </Form.Label>
              </Col>

              <Col sm={7}>
                <FormControl id="minX" type="number" value={this.props.minX} onChange={this.props.onMinXChange} />
              </Col>
            </Row>

            <Row className="align-items-center pb-2">
              <Col sm={5}>
                <Form.Label htmlFor="maxX">
                  Max X (mm)
                </Form.Label>
              </Col>

              <Col sm={7}>
                <FormControl id="maxX" type="number" value={this.props.maxX} onChange={this.props.onMaxXChange} />
              </Col>
            </Row>

            <Row className="align-items-center pb-2">
              <Col sm={5}>
                <Form.Label htmlFor="minY">
                  Min Y (mm)
                </Form.Label>
              </Col>

              <Col sm={7}>
                <FormControl id="minY" type="number" value={this.props.minY} onChange={this.props.onMinYChange} />
              </Col>
            </Row>

            <Row className="align-items-center pb-2">
              <Col sm={5}>
                <Form.Label htmlFor="maxY">
                  Max Y (mm)
                </Form.Label>
              </Col>

              <Col sm={7}>
                <FormControl id="maxY" type="number" value={this.props.maxY} onChange={this.props.onMaxYChange} />
              </Col>
            </Row>

            <Row className="align-items-center pb-2">
              <Col sm={5}>
                <Form.Label htmlFor="origin">
                  Force origin
                </Form.Label>
              </Col>

              <Col sm={7}>
                <ToggleButtonGroup id="origin-bar" type="checkbox" name="origin" className="flex-wrap" value={this.props.origin} onChange={this.props.onOriginChange}>
                  <ToggleButton variant="light" value={1} >upper left</ToggleButton>
                  <ToggleButton variant="light" value={2} >upper right</ToggleButton>
                  <ToggleButton variant="light" value={0} >lower left</ToggleButton>
                  <ToggleButton variant="light" value={3} >lower right</ToggleButton>
                </ToggleButtonGroup>
              </Col>
            </Row>

            <Row className="align-items-center pb-1">
              <Col sm={5}>
                <Form.Label htmlFor="minimizeMoves">
                  Try to minimize<br />perimeter moves
                </Form.Label>
              </Col>
              <Col sm={7}>
                <Switch checked={this.props.minimizeMoves} onChange={this.props.toggleMinimizeMoves} />
              </Col>
            </Row>
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(RectSettings)
