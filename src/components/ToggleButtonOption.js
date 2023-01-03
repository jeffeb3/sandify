import React, { Component } from 'react'
import {
  Col,
  Form,
  Row,
  ToggleButton,
  ToggleButtonGroup
} from 'react-bootstrap'

class ToggleButtonOption extends Component {
  render() {
    const option = this.props.optionDefinition
    const model = this.props.model
    const currentChoice = model[this.props.optionKey]
    const visible = option.isVisible === undefined ? true : option.isVisible(model)

    return (
      <Row className={"align-items-center py-1" + (visible ? '' : ' d-none')}>
        <Col sm={5}>
          <Form.Label>
            {option.title}
          </Form.Label>
        </Col>

        <Col sm={7}>
          <ToggleButtonGroup
              type="radio"
              name={this.props.optionKey}
              value={currentChoice}
              key={this.props.optionKey}
              onChange={(choice) => {
                let attrs = {}
                attrs[this.props.optionKey] = choice
                this.props.onChange(attrs)
              }}>
            {option.choices.map((choice) => {
              return <ToggleButton
                key={choice}
                variant="light"
                value={choice}>{choice}</ToggleButton>
            })}
          </ToggleButtonGroup>
        </Col>
      </Row>
    )
  }
}

export default ToggleButtonOption
