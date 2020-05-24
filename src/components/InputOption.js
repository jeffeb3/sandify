import React, { Component } from 'react'
import {
  Col,
  Form,
  Row
} from 'react-bootstrap'
import debounce from 'lodash/debounce'

class InputOption extends Component {
  constructor(props) {
    super(props);
    this.delayedSet = debounce( (value, key, onChange) => {
      let attrs = {}
      attrs[key] = value
      onChange(attrs)
    }, 1500)
  }

  render() {
    const option = this.props.options[this.props.optionKey]
    const model = this.props.model
    const optionType = option.type || 'number'
    const minimum = (typeof option.min === 'function') ? option.min(model) : parseFloat(option.min)
    const maximum = (typeof option.max === 'function') ? option.max(model) : parseFloat(option.max)
    const visible = option.isVisible === undefined ? true : option.isVisible(model)

    return (
      <Row className={"align-items-center pb-1" + (visible ? '' : ' d-none')}>
        <Col sm={5}>
        <Form.Label htmlFor="options-step">
          {option.title}
        </Form.Label>
        </Col>

        <Col sm={7}>
          <Form.Control
            as={optionType==="textarea" ? "textarea" : "input"}
            type={optionType}
            step={option.step ? option.step : 1}
            min={!isNaN(minimum) ? minimum : ''}
            max={!isNaN(maximum) ? maximum : ''}
            value={model[this.props.optionKey]}
            onChange={(event) => {
              let attrs = {}
              let value = event.target.value

              if (optionType === 'number') {
                value = value === '' ? '' : parseFloat(value)
              }

              attrs[this.props.optionKey] = value
              if (option.onChange !== undefined) {
                attrs = option.onChange(attrs, model)
              }
              this.props.onChange(attrs)
              if (this.props.delayKey !== undefined) {
                this.delayedSet(value, this.props.delayKey, this.props.onChange)
              }
            }}
            />
        </Col>
      </Row>
    )
  }
}

export default InputOption
