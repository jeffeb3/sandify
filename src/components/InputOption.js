import React, { Component } from 'react'
import {
  Col,
  Form,
  Row
} from 'react-bootstrap'

class InputOption extends Component {
  render() {
    const option = this.props.options[this.props.optionKey]
    const model = this.props.model
    const optionType = option.type || 'number'

    return (
      <Row className="align-items-center pb-2">
        <Col sm={5}>
        <Form.Label htmlFor="options-step">
          {option.title}
        </Form.Label>
        </Col>

        <Col sm={7}>
          <Form.Control
            id="options-step"
            type={optionType}
            step={option.step ? option.step : 1}
            value={model[this.props.optionKey]}
            onChange={(event) => {
              let attrs = {}
              let value = event.target.value

              if (optionType === 'number') value = value === '' ? '' : parseFloat(value)
              attrs[this.props.optionKey] = value
              this.props.onChange(attrs)
            }} />
        </Col>
      </Row>
    )
  }
}

export default InputOption
