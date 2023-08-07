import React from "react"
import {
  Col,
  Form,
  Row,
  ToggleButton,
  ToggleButtonGroup,
} from "react-bootstrap"

const ToggleButtonOption = (props) => {
  const option = props.options[props.optionKey]
  const { data } = props
  const object = props.object || data
  const currentChoice = data[props.optionKey]
  const visible =
    option.isVisible === undefined ? true : option.isVisible(object, data)

  const handleChange = (choice) => {
    let attrs = {}
    attrs[props.optionKey] = choice
    props.onChange(attrs)
  }

  return (
    <Row className={"align-items-center py-1" + (visible ? "" : " d-none")}>
      <Col
        sm={5}
        className="mb-1"
      >
        <Form.Label>{option.title}</Form.Label>
      </Col>

      <Col
        sm={7}
        className="mb-1"
      >
        <ToggleButtonGroup
          type="radio"
          className="border"
          name={props.optionKey}
          value={currentChoice}
          key={props.optionKey}
          onChange={handleChange}
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

export default ToggleButtonOption
