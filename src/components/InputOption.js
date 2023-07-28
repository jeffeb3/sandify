import React, { useState, useEffect } from "react"
import { Col, Form, Row } from "react-bootstrap"
import debounce from "lodash/debounce"

const InputOption = ({
  data,
  options,
  optionKey,
  handleChange,
  delayKey,
  object,
  label = true,
}) => {
  const [value, setValue] = useState(data[optionKey])

  useEffect(() => {
    setValue(data[optionKey])
  }, [data, optionKey])

  const option = options[optionKey]
  const optionType = option.type || "number"
  const minimum =
    typeof option.min === "function" ? option.min(data) : parseFloat(option.min)
  const maximum =
    typeof option.max === "function" ? option.max(data) : parseFloat(option.max)
  const visible =
    option.isVisible === undefined ? true : option.isVisible(object, data)

  const delayedSet = debounce((value, key, handleChange) => {
    let attrs = {}
    attrs[key] = value
    handleChange(attrs)
  }, 1500)

  const renderedInput = (
    <Form.Control
      as={optionType === "textarea" ? "textarea" : "input"}
      name={`option-${optionKey}`}
      type={optionType}
      step={option.step ? option.step : 1}
      min={!isNaN(minimum) ? minimum : ""}
      max={!isNaN(maximum) ? maximum : ""}
      value={value}
      autoComplete="off"
      plaintext={option.plainText}
      onChange={(event) => {
        let newValue = event.target.value

        if (optionType === "number") {
          newValue = newValue === "" ? "" : parseFloat(newValue)
        }

        setValue(newValue)

        let attrs = {}
        attrs[optionKey] = newValue

        if (option.handleChange !== undefined) {
          attrs = option.handleChange(object, attrs, data)
        }
        handleChange(attrs)

        if (delayKey !== undefined) {
          delayedSet(newValue, delayKey, handleChange)
        }
      }}
    />
  )

  if (!option.inline) {
    return (
      <Row className={"align-items-center pb-1" + (visible ? "" : " d-none")}>
        <Col sm={5}>
          {label && (
            <Form.Label htmlFor={`option-${optionKey}`}>
              {option.title}
            </Form.Label>
          )}
        </Col>
        <Col sm={7}>{renderedInput}</Col>
      </Row>
    )
  } else {
    return (
      <div className="d-flex align-items-center">
        {label && (
          <Form.Label
            htmlFor={`option-${optionKey}`}
            className="mr-2"
            style={{ width: "22px" }}
          >
            {option.title}
          </Form.Label>
        )}
        {renderedInput}
      </div>
    )
  }
}
export default InputOption
