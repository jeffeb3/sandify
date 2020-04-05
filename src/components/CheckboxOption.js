import React, { Component } from 'react'
import {
  Col,
  Row,
  Form,
} from 'react-bootstrap'

class CheckboxOption extends Component {
  render() {
    const option = this.props.options[this.props.optionKey]
    const model = this.props.model

    return (
      <Row className="align-items-center pb-2">
        <Col sm={5}>
        <Form.Label htmlFor="options-step">
          {option.title}
        </Form.Label>
        </Col>

        <Col sm={7}>
          <Form.Check
            checked={model[this.props.optionKey]}
            onChange={(event) => {
              let attrs = {}
              let value = event.target.checked

              attrs[this.props.optionKey] = value
              this.props.onChange(attrs)
            }} />
        </Col>
      </Row>
    )
  }
}

export default CheckboxOption
