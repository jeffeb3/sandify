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
import { updateLayer, toggleGrow } from '../layers/layersSlice'
import { getCurrentLayer } from '../layers/selectors'
import Transform from '../../models/Transform'

const mapStateToProps = (state, ownProps) => {
  const layer = getCurrentLayer(state)

  return {
    layer: layer,
    active: layer.growEnabled,
    options: (new Transform()).getOptions()
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const { id } = ownProps

  return {
    onChange: (attrs) => {
      attrs.id = id
      dispatch(updateLayer(attrs))
    },
    onGrowMethodChange: (value) => {
      dispatch(updateLayer({ growMethod: value, id: id}))
    },
    onGrow: () => {
      dispatch(toggleGrow({id: id}))
    },
  }
}

class ScaleTransform extends Component {
  render() {
    const activeClassName = this.props.active ? 'active' : ''
    const activeKey = this.props.active ? 1 : null

    return (
      <Accordion defaultActiveKey={activeKey} activeKey={activeKey}>
        <Card className={`${activeClassName} overflow-auto`}>
          <Accordion.Toggle as={Card.Header} eventKey={1} onClick={this.props.onGrow}>
            <h3>Scale</h3>
            Grows or shrinks the shape
          </Accordion.Toggle>

          <Accordion.Collapse eventKey={1}>
            <Card.Body>

              <InputOption
                onChange={this.props.onChange}
                options={this.props.options}
                key="growValue"
                optionKey="growValue"
                index={2}
                model={this.props.layer} />
              <Row className="align-items-center pb-2">
                <Col sm={5}>
                  <Form.Label htmlFor="growMethod">
                    Scale by
                  </Form.Label>
                </Col>
                <Col sm={7}>
                  <ToggleButtonGroup id="growMethod" type="radio" name="growMethod" value={this.props.layer.growMethod} onChange={this.props.onGrowMethodChange}>
                    <ToggleButton variant="light" value="constant">constant</ToggleButton>
                    <ToggleButton variant="light" value="function">function</ToggleButton>
                  </ToggleButtonGroup>
                </Col>
              </Row>

              <InputOption
                onChange={this.props.onChange}
                options={this.props.options}
                key="growMathInput"
                optionKey="growMathInput"
                delayKey="growMath"
                index={1}
                model={this.props.layer} />
            </Card.Body>
          </Accordion.Collapse>
        </Card>
      </Accordion>
    )
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(ScaleTransform)
