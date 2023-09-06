import React from "react"
import Col from "react-bootstrap/Col"
import Row from "react-bootstrap/Row"
import Form from "react-bootstrap/Form"
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
        return { value: key, label: choices[key] }
      })
  const currentLabel = choices.find(
    (choice) => choice.value == currentChoice,
  ).label
  const handleChange = (choice) => {
    const value = choice.value
    let attrs = {}
    attrs[optionKey] = value

    if (option.onChange !== undefined) {
      attrs = option.onChange(object, attrs, data)
    }

    onChange(attrs)
  }

  return (
    <Row
      className="align-items-center"
      key={index}
    >
      <Col
        sm={5}
        className="mb-1"
      >
        <Form.Label htmlFor="options-dropdown">{option.title}</Form.Label>
      </Col>

      <Col
        sm={7}
        className="mb-1"
      >
        <Select
          value={{ value: currentChoice, label: currentLabel }}
          onChange={handleChange}
          options={choices}
          menuPortalTarget={document.body}
          styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
        />
      </Col>
    </Row>
  )
}

export default DropdownOption
