import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
    Accordion,
    Card,
    Col,
    Form,
    Row,
    ToggleButton,
    ToggleButtonGroup,
} from 'react-bootstrap'
import InputOption from '../../components/InputOption'
import CheckboxOption from '../../components/CheckboxOption'
import Machine from '../../models/Machine'
import {
  updateMachine,
  toggleMinimizeMoves,
  toggleMachineRectExpanded,
  setMachineRectOrigin
} from './machineSlice'

const mapStateToProps = (state, ownProps) => {
  return {
    expanded: state.machine.rectExpanded,
    active:   state.machine.rectangular,
    minX:    state.machine.minX,
    maxX:    state.machine.maxX,
    minY:    state.machine.minY,
    maxY:    state.machine.maxY,
    origin:   state.machine.rectOrigin,
    minimizeMoves: state.machine.minimizeMoves,
    options: new Machine().getOptions()
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    activeCallback: (event) => {
      dispatch(toggleMachineRectExpanded())
    },
    onChange: (attrs) => {
      dispatch(updateMachine(attrs))
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
            <InputOption
              onChange={this.props.onChange}
              options={this.props.options}
              key="minX"
              optionKey="minX"
              index={0}
              model={this.props} />

            <InputOption
              onChange={this.props.onChange}
              options={this.props.options}
              key="maxX"
              optionKey="maxX"
              index={0}
              model={this.props} />

            <InputOption
              onChange={this.props.onChange}
              options={this.props.options}
              key="minY"
              optionKey="minY"
              index={0}
              model={this.props} />

            <InputOption
              onChange={this.props.onChange}
              options={this.props.options}
              key="maxY"
              optionKey="maxY"
              index={0}
              model={this.props} />

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

            <CheckboxOption
              onChange={this.props.onChange}
              options={this.props.options}
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

export default connect(mapStateToProps, mapDispatchToProps)(RectSettings)
