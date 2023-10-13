import React from "react"
import Col from "react-bootstrap/Col"
import Row from "react-bootstrap/Row"
import Form from "react-bootstrap/Form"
import S from "react-switch"
const Switch = S.default ? S.default : S // Fix: https://github.com/vitejs/vite/issues/2139

const CheckboxOption = ({
  options,
  optionKey,
  data,
  model,
  onChange,
  label = true,
}) => {
  const option = options[optionKey]
  const visible =
    option.isVisible === undefined ? true : option.isVisible(model, data)

  const handleChange = (checked) => {
    let attrs = {}
    attrs[optionKey] = checked

    if (option.onChange !== undefined) {
      attrs = option.onChange(model, attrs, data)
    }

    onChange(attrs)
  }

  return (
    <Row className={"align-items-center mb-1" + (visible ? "" : " d-none")}>
      <Col sm={5}>
        {label && (
          <Form.Label
            htmlFor="options-step"
            className="mb-0"
          >
            {option.title}
          </Form.Label>
        )}
      </Col>

      <Col
        sm={7}
        className="d-flex align-items-center"
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
