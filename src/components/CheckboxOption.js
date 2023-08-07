import React from "react"
import { Col, Row, Form } from "react-bootstrap"
import S from "react-switch"
const Switch = S.default ? S.default : S // Fix: https://github.com/vitejs/vite/issues/2139

const CheckboxOption = ({ options, optionKey, data, object, onChange }) => {
  const option = options[optionKey]
  const visible =
    option.isVisible === undefined ? true : option.isVisible(object, data)

  const handleChange = (checked) => {
    let attrs = {}
    attrs[optionKey] = checked

    if (option.onChange !== undefined) {
      attrs = option.onChange(object, attrs, data)
    }

    onChange(attrs)
  }

  return (
    <Row className={"align-items-center" + (visible ? "" : " d-none")}>
      <Col
        sm={5}
        className="mb-1"
      >
        <Form.Label htmlFor="options-step">{option.title}</Form.Label>
      </Col>

      <Col
        sm={7}
        className="mb-1"
      >
        <Switch
          checked={data[optionKey]}
          onChange={handleChange}
        />
      </Col>
    </Row>
  )
}
export default CheckboxOption
