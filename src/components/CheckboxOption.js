import React from "react"
import { Col, Row, Form } from "react-bootstrap"
import S from "react-switch"
const Switch = S.default ? S.default : S // Fix: https://github.com/vitejs/vite/issues/2139

const CheckboxOption = ({ options, optionKey, data, object, handleChange }) => {
  const option = options[optionKey]
  const visible =
    option.isVisible === undefined ? true : option.isVisible(object, data)

  return (
    <Row className={"align-items-center mt-1" + (visible ? "" : " d-none")}>
      <Col sm={5}>
        <Form.Label htmlFor="options-step">{option.title}</Form.Label>
      </Col>

      <Col sm={7}>
        <Switch
          checked={data[optionKey]}
          onChange={(checked) => {
            let attrs = {}
            attrs[optionKey] = checked

            if (option.handleChange !== undefined) {
              attrs = option.handleChange(object, attrs, data)
            }

            handleChange(attrs)
          }}
        />
      </Col>
    </Row>
  )
}
export default CheckboxOption
