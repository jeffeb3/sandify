import React from "react"
import Col from "react-bootstrap/Col"
import Row from "react-bootstrap/Row"
import Form from "react-bootstrap/Form"
import ToggleButton from "react-bootstrap/ToggleButton"
import ToggleButtonGroup from "react-bootstrap/ToggleButtonGroup"

const ToggleButtonOption = (props) => {
  const option = props.options[props.optionKey]
  const { data } = props
  const model = props.model || data
  const currentChoice = data[props.optionKey]
  const visible =
    option.isVisible === undefined ? true : option.isVisible(model, data)

  const handleChange = (choice) => {
    let attrs = {}
    attrs[props.optionKey] = choice

    if (option.onChange !== undefined) {
      attrs = option.onChange(model, attrs, data)
    }

    props.onChange(attrs)
  }

  return (
    <Row className={"align-items-center mb-1" + (visible ? "" : " d-none")}>
      <Col sm={5}>
        <Form.Label className="m-0">{option.title}</Form.Label>
      </Col>

      <Col sm={7}>
        <ToggleButtonGroup
          type="radio"
          className="border"
          size="sm"
          name={props.optionKey}
          value={currentChoice}
          key={props.optionKey}
          onChange={handleChange}
        >
          {option.choices.map((choice) => {
            return (
              <ToggleButton
                key={choice}
                id={`${props.optionKey}-${choice}`}
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
