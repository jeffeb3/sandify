import React, { Component } from "react"
import { Col, Form, Row } from "react-bootstrap"
import debounce from "lodash/debounce"

class InputOption extends Component {
  constructor(props) {
    super(props)
    this.delayedSet = debounce((value, key, onChange) => {
      let attrs = {}
      attrs[key] = value
      onChange(attrs)
    }, 1500)
  }

  render() {
    const {
      data,
      options,
      optionKey,
      onChange,
      delayKey,
      label = true,
    } = this.props
    const option = options[optionKey]
    const object = this.props.object || data
    const optionType = option.type || "number"
    const minimum =
      typeof option.min === "function"
        ? option.min(data)
        : parseFloat(option.min)
    const maximum =
      typeof option.max === "function"
        ? option.max(data)
        : parseFloat(option.max)
    const visible =
      option.isVisible === undefined ? true : option.isVisible(object, data)

    const renderedInput = (
      <Form.Control
        as={optionType === "textarea" ? "textarea" : "input"}
        name={`option-${optionKey}`}
        type={optionType}
        step={option.step ? option.step : 1}
        min={!isNaN(minimum) ? minimum : ""}
        max={!isNaN(maximum) ? maximum : ""}
        value={data[optionKey]}
        autoComplete="off"
        plaintext={option.plainText}
        onChange={(event) => {
          let attrs = {}
          let value = event.target.value

          if (optionType === "number") {
            value = value === "" ? "" : parseFloat(value)
          }

          attrs[optionKey] = value

          if (option.onChange !== undefined) {
            attrs = option.onChange(object, attrs, data)
          }
          onChange(attrs)

          if (delayKey !== undefined) {
            this.delayedSet(value, delayKey, onChange)
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
}

export default InputOption
