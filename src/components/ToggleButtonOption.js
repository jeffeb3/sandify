import React, { Component } from "react"
import {
  Col,
  Form,
  Row,
  ToggleButton,
  ToggleButtonGroup,
} from "react-bootstrap"

class ToggleButtonOption extends Component {
  render() {
    const option = this.props.options[this.props.optionKey]
    const { data } = this.props
    const object = this.props.object || data
    const currentChoice = data[this.props.optionKey]
    const visible =
      option.isVisible === undefined ? true : option.isVisible(object, data)

    return (
      <Row className={"align-items-center py-1" + (visible ? "" : " d-none")}>
        <Col sm={5}>
          <Form.Label>{option.title}</Form.Label>
        </Col>

        <Col sm={7}>
          <ToggleButtonGroup
            type="radio"
            className="border"
            name={this.props.optionKey}
            value={currentChoice}
            key={this.props.optionKey}
            onChange={(choice) => {
              let attrs = {}
              attrs[this.props.optionKey] = choice
              this.props.handleChange(attrs)
            }}
          >
            {option.choices.map((choice) => {
              return (
                <ToggleButton
                  key={choice}
                  variant="light"
                  value={choice}
                >
                  {choice}
                </ToggleButton>
              )
            })}
          </ToggleButtonGroup>
        </Col>
      </Row>
    )
  }
}

export default ToggleButtonOption
