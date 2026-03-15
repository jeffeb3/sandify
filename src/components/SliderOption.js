import Slider from "rc-slider"
import React, { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
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
  const { t } = useTranslation()
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
    const newValue = parseFloat(e.target.value)

    handleChange(e.target.value)
    if (!isNaN(newValue) && newValue >= minimum && newValue <= maximum) {
      handleChangeComplete(newValue)
    }
  }

  const handleInputBlur = (e) => {
    let newValue = parseFloat(e.target.value)

    if (isNaN(newValue)) {
      newValue = 0
    } else if (newValue < minimum) {
      newValue = minimum
    } else if (newValue > maximum) {
      newValue = maximum
    }

    handleChange(newValue)
    handleChangeComplete(newValue)
  }

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.target.blur()
    }
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
  let sliderValue

  if (option.range) {
    // Range slider: value should be an array [min, max]
    const rangeValue = Array.isArray(value) ? value : [minimum, maximum]
    sliderValue = [
      Math.min(Math.max(rangeValue[0], minimum), maximum),
      Math.min(Math.max(rangeValue[1], minimum), maximum),
    ]
    marks =
      isNaN(minimum) || isNaN(maximum)
        ? {}
        : {
            [minimum]: `${minimum}`,
            [sliderValue[0]]: `${sliderValue[0]}`,
            [sliderValue[1]]: `${sliderValue[1]}`,
            [maximum]: `${maximum}`,
          }
  } else {
    // Regular slider: value is a single number
    const parsedValue = parseFloat(value)
    sliderValue = Math.min(
      Math.max(isNaN(parsedValue) ? minimum : parsedValue, minimum),
      maximum,
    )
    marks =
      isNaN(minimum) || isNaN(maximum)
        ? {}
        : {
            [minimum]: `${minimum}`,
            [sliderValue]: `${sliderValue}`,
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
        value={sliderValue}
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
      onBlur={handleInputBlur}
      onKeyDown={handleInputKeyDown}
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
            {t(title)}
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
