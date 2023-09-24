import React from "react"
import Col from "react-bootstrap/Col"
import Row from "react-bootstrap/Row"
import Form from "react-bootstrap/Form"
import Select from "react-select"

const DropdownOption = ({
  options,
  optionKey,
  data,
  model,
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
  const currentLabel = (
    choices.find((choice) => choice.value == currentChoice) || choices[0]
  ).label
  const visible =
    option.isVisible === undefined ? true : option.isVisible(model, data)

  const handleChange = (choice) => {
    const value = choice.value
    let attrs = {}
    attrs[optionKey] = value

    if (option.onChange !== undefined) {
      attrs = option.onChange(model, attrs, data)
    }

    onChange(attrs)
  }

  return (
    <Row
      className={"align-items-center mb-1" + (visible ? "" : " d-none")}
      key={index}
    >
      <Col sm={5}>
        <Form.Label
          className="m-0"
          htmlFor="options-dropdown"
        >
          {option.title}
        </Form.Label>
      </Col>

      <Col sm={7}>
        <Select
          value={{ value: currentChoice, label: currentLabel }}
          onChange={handleChange}
          options={choices}
          menuPortalTarget={document.body}
          menuPlacement="auto"
          styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
        />
      </Col>
    </Row>
  )
}

export default DropdownOption
