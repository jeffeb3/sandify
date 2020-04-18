import React, { Component } from 'react'
import {
  Col,
  Row,
  Form,
} from 'react-bootstrap'
import Switch from 'react-switch'

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
          <Switch
            checked={model[this.props.optionKey]}
            onChange={(checked) => {
              let attrs = {}
              attrs[this.props.optionKey] = checked

              if (option.onChange !== undefined) {
                attrs = option.onChange(attrs)
              }
              
              this.props.onChange(attrs)
            }} />
        </Col>
      </Row>
    )
  }
}

export default CheckboxOption
