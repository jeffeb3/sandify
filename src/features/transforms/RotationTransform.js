import { connect } from 'react-redux'
import React, { Component } from 'react'
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
import {
  toggleSpin,
  updateShape,
} from '../shapes/shapesSlice'
import { getCurrentShapeSelector } from '../shapes/selectors'
import Transform from '../../models/Transform'

const mapStateToProps = (state, ownProps) => {
  const shape = getCurrentShapeSelector(state)

  return {
    shape: shape,
    active: shape.spinEnabled,
    options: (new Transform()).getOptions()
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const { id } = ownProps

  return {
    onChange: (attrs) => {
      attrs.id = id
      dispatch(updateShape(attrs))
    },
    onSpinMethodChange: (value) => {
      dispatch(updateShape({ spinMethod: value, id: id}))
    },
    onSpin: () => {
      dispatch(toggleSpin({id: id}))
    },
  }
}

class RotationTransform extends Component {
  render() {
    const activeClassName = this.props.active ? 'active' : ''
    const activeKey = this.props.active ? 0 : null

    return (
      <Accordion defaultActiveKey={activeKey} activeKey={activeKey}>
        <Card className={`${activeClassName} overflow-auto`}>
          <Accordion.Toggle as={Card.Header} eventKey={0} onClick={this.props.onSpin}>
            <h3>Spin</h3>
            Spins the shape
          </Accordion.Toggle>

          <Accordion.Collapse eventKey={0}>
            <Card.Body>

              <InputOption
                onChange={this.props.onChange}
                options={this.props.options}
                key="spinValue"
                optionKey="spinValue"
                index={0}
                model={this.props.shape} />

              <Row className="align-items-center pb-2">
                <Col sm={5}>
                  <Form.Label htmlFor="spinMethod">
                    Scale by
                  </Form.Label>
                </Col>

                <Col sm={7}>
                  <ToggleButtonGroup id="spinMethod" type="radio" name="spinMethod" value={this.props.shape.spinMethod} onChange={this.props.onSpinMethodChange}>
                    <ToggleButton variant="light" value="constant">constant</ToggleButton>
                    <ToggleButton variant="light" value="function">function</ToggleButton>
                  </ToggleButtonGroup>
                </Col>
              </Row>

              <InputOption
                onChange={this.props.onChange}
                options={this.props.options}
                key="spinMathInput"
                optionKey="spinMathInput"
                delayKey="spinMath"
                index={1}
                model={this.props.shape} />

              <InputOption
                onChange={this.props.onChange}
                options={this.props.options}
                key="spinSwitchbacks"
                optionKey="spinSwitchbacks"
                index={0}
                model={this.props.shape} />
            </Card.Body>
          </Accordion.Collapse>
        </Card>
      </Accordion>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(RotationTransform)
