import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
    Accordion,
    Col,
    Row,
    Form,
    Card,
    ToggleButton,
    ToggleButtonGroup
} from 'react-bootstrap'
import Switch from 'react-switch'
import {
  toggleMachinePolarExpanded,
  updateMachine,
  toggleMinimizeMoves
} from './machineSlice'

const mapStateToProps = (state, ownProps) => {
  return {
    expanded: state.machine.polarExpanded,
    active: !state.machine.rectangular,
    maxRadius: state.machine.maxRadius,
    startPoint: state.machine.polarStartPoint,
    endPoint: state.machine.polarEndPoint,
    minimizeMoves: state.machine.minimizeMoves
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    activeCallback: (event) => {
      dispatch(toggleMachinePolarExpanded())
    },
    onMaxRadiusChange: (event) => {
      dispatch(updateMachine({maxRadius: parseFloat(event.target.value)}))
    },
    onStartPointChange: (value) => {
      dispatch(updateMachine({polarStartPoint: value}))
    },
    onEndPointChange: (value) => {
      dispatch(updateMachine({polarEndPoint: value}))
    },
    toggleMinimizeMoves: () => {
      dispatch(toggleMinimizeMoves());
    },
  }
}

class PolarSettings extends Component {
  render() {
    var activeClassName = this.props.active ? 'active' : ''

    return (
      <Card className={`${activeClassName} overflow-auto`}>
        <Accordion.Toggle as={Card.Header} eventKey={1} onClick={this.props.activeCallback}>
          <h3>Polar machine</h3>
          Polar machines like Sisyphus
        </Accordion.Toggle>

        <Accordion.Collapse eventKey={1}>
          <Card.Body>
            <Row className="align-items-center pb-1">
              <Col sm={5}>
                <Form.Label htmlFor="maxRadius">
                  Max radius (mm)
                </Form.Label>
              </Col>
              <Col sm={7}>
                <Form.Control id="maxRadius" type="number" value={this.props.maxRadius} onChange={this.props.onMaxRadiusChange} />
              </Col>
            </Row>

            <Row className="align-items-center pb-2">
              <Col sm={5}>
                <Form.Label htmlFor="forceStart">
                  Start point
                </Form.Label>
              </Col>

              <Col sm={7}>
                <ToggleButtonGroup id="startPoint" type="radio" name="startPoint" value={this.props.startPoint} onChange={this.props.onStartPointChange}>
                  <ToggleButton variant="light" value="none">none</ToggleButton>
                  <ToggleButton variant="light" value="center">center</ToggleButton>
                  <ToggleButton variant="light" value="perimeter">perimeter</ToggleButton>
                </ToggleButtonGroup>
              </Col>
            </Row>

            <Row className="align-items-center pb-2">
              <Col sm={5}>
                <Form.Label htmlFor="endPoint">
                  End point
                </Form.Label>
              </Col>

              <Col sm={7}>
                <ToggleButtonGroup id="endPoint" type="radio" name="endPoint" value={this.props.endPoint} onChange={this.props.onEndPointChange}>
                  <ToggleButton variant="light" value="none">none</ToggleButton>
                  <ToggleButton variant="light" value="center">center</ToggleButton>
                  <ToggleButton variant="light" value="perimeter">perimeter</ToggleButton>
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

export default connect(mapStateToProps, mapDispatchToProps)(PolarSettings)
