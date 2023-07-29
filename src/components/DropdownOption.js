import React from "react"
import { Col, Form, Row } from "react-bootstrap"
import Select from "react-select"

const DropdownOption = ({
  options,
  optionKey,
  data,
  object,
  onChange,
  index,
}) => {
  const option = options[optionKey]
  const currentChoice = data[optionKey]

  let choices = option.choices
  if (typeof choices === "function") {
    choices = choices()
  }

  choices = Array.isArray(choices)
    ? choices.map((choice) => {
        return { value: choice, label: choice }
      })
    : Object.keys(choices).map((key) => {
        return { value: key, label: option.choices[key] }
      })
  const currentLabel = Array.isArray(choices)
    ? currentChoice
    : choices[currentChoice]

  const handleChange = (choice) => {
    const value = choice.value
    let attrs = {}
    attrs[optionKey] = value

    if (option.handleChange !== undefined) {
      attrs = option.handleChange(object, attrs, data)
    }

    onChange(attrs)
  }

  return (
    <Row
      className="align-items-center pb-2"
      key={index}
    >
      <Col sm={5}>
        <Form.Label htmlFor="options-dropdown">{option.title}</Form.Label>
      </Col>

      <Col sm={7}>
        <Select
          value={{ value: currentChoice, label: currentLabel }}
          onChange={handleChange}
          options={choices}
        />
      </Col>
    </Row>
  )
}

export default DropdownOption
