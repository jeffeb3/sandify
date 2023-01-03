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
import InputOption from '../../components/InputOption'
import CheckboxOption from '../../components/CheckboxOption'
import { getMachine } from '../store/selectors'
import { machineOptions } from './options'
import {
  toggleMachinePolarExpanded,
  updateMachine,
  toggleMinimizeMoves
} from './machineSlice'

const mapStateToProps = (state, ownProps) => {
  const machine = getMachine(state)

  return {
    expanded: machine.polarExpanded,
    active: !machine.rectangular,
    maxRadius: machine.maxRadius,
    startPoint: machine.polarStartPoint,
    endPoint: machine.polarEndPoint,
    minimizeMoves: machine.minimizeMoves,
    options: machineOptions
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    activeCallback: (event) => {
      dispatch(toggleMachinePolarExpanded())
    },
    onChange: (attrs) => {
      dispatch(updateMachine(attrs))
    },
    onStartPointChange: (value) => {
      dispatch(updateMachine({polarStartPoint: value}))
    },
    onEndPointChange: (value) => {
      dispatch(updateMachine({polarEndPoint: value}))
    },
    toggleMinimizeMoves: () => {
      dispatch(toggleMinimizeMoves())
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
            <InputOption
              onChange={this.props.onChange}
              optionDefinition={this.props.options["maxRadius"]}
              key="maxRadius"
              optionKey="maxRadius"
              index={0}
              model={this.props} />

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

            <CheckboxOption
              onChange={this.props.onChange}
              optionDefinition={this.props.options["minimizeMoves"]}
              optionKey="minimizeMoves"
              key="minimizeMoves"
              index={0}
              model={this.props} />
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PolarSettings)
