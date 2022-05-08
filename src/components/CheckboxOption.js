import React, { Component } from 'react'
import {
  Col,
  Row,
  Form,
} from 'react-bootstrap'
import S from "react-switch"
const Switch = S.default ? S.default: S // Fix: https://github.com/vitejs/vite/issues/2139

class CheckboxOption extends Component {
  render() {
    const option = this.props.options[this.props.optionKey]
    const model = this.props.model
    const visible = option.isVisible === undefined ? true : option.isVisible(model)

    return (
      <Row className={"align-items-center" + (visible ? '' : ' d-none')}>
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
                attrs = option.onChange(attrs, model)
              }

              this.props.onChange(attrs)
            }} />
        </Col>
      </Row>
    )
  }
}

export default CheckboxOption
