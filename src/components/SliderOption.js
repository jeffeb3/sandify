import Slider from "rc-slider"
import React, { useState, useEffect } from "react"
import Col from "react-bootstrap/Col"
import Row from "react-bootstrap/Row"
import Form from "react-bootstrap/Form"

const SliderOption = ({
  data,
  options,
  optionKey,
  onChange,
  model,
  label = true,
}) => {
  const [value, setValue] = useState(data[optionKey])

  useEffect(() => {
    setValue(data[optionKey])
  }, [data, optionKey])

  const option = options[optionKey]
  const step = option.step ? option.step : 1
  const minimum =
    typeof option.min === "function" ? option.min(data) : parseFloat(option.min)
  const maximum =
    typeof option.max === "function" ? option.max(data) : parseFloat(option.max)
  const visible =
    option.isVisible === undefined ? true : option.isVisible(model, data)
  const enabled =
    option.isEnabled === undefined ? true : option.isEnabled(model, data)
  const title =
    typeof option.title === "function"
      ? option.title(model, data)
      : option.title
  const inputWidth = "66px"

  if (!visible) {
    return null
  }

  const handleChange = (newValue) => {
    setValue(newValue)
  }

  const handleInputChange = (e) => {
    handleChange(e.target.value)
  }

  const handleChangeComplete = (newValue) => {
    let attrs = {}
    attrs[optionKey] = newValue

    if (option.onChange !== undefined) {
      attrs = option.onChange(model, attrs, data)
    }
    onChange(attrs)
  }

  let marks
  if (isNaN(minimum) || isNaN(maximum)) {
    marks = {}
  } else if (option.range) {
    marks = {
      [minimum]: `${minimum}`,
      [value[0]]: `${value[0]}`,
      [value[1]]: `${value[1]}`,
      [maximum]: `${maximum}`,
    }
  } else {
    marks = {
      [minimum]: `${minimum}`,
      [value]: `${value}`,
      [maximum]: `${maximum}`,
    }
  }

  const renderedSlider = (
    <div>
      <Slider
        disabled={!enabled}
        name={`option-${optionKey}`}
        min={!isNaN(minimum) ? minimum : ""}
        max={!isNaN(maximum) ? maximum : ""}
        marks={marks}
        range={option.range}
        allowCross={false}
        value={value}
        onChangeComplete={handleChangeComplete}
        onChange={handleChange}
      />
    </div>
  )

  const renderedInput = (
    <Form.Control
      disabled={!enabled}
      as="input"
      name={`option-${optionKey}`}
      type="number"
      step={step}
      min={!isNaN(minimum) ? minimum : ""}
      max={!isNaN(maximum) ? maximum : ""}
      value={value}
      autoComplete="off"
      onChange={handleInputChange}
    />
  )

  return (
    <Row className={"align-items-center mb-3" + (visible ? "" : " d-none")}>
      <Col sm={5}>
        {label && (
          <Form.Label
            htmlFor={`option-${optionKey}`}
            className="mb-0"
          >
            {title}
          </Form.Label>
        )}
      </Col>
      <Col sm={7}>
        <div className="d-flex align-items-center mb-2 mx-1">
          <div className="me-3 flex-grow-1">{renderedSlider}</div>
          {!option.range && (
            <div style={{ width: inputWidth }}>{renderedInput}</div>
          )}
        </div>
      </Col>
    </Row>
  )
}
export default SliderOption
