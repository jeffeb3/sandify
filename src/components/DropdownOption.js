import React, { Component } from 'react'
import {
  Col,
  Form,
  Row
} from 'react-bootstrap'
import Select from 'react-select'

class DropdownOption extends Component {
  render() {
    const option = this.props.options[this.props.optionKey]
    const model = this.props.model
    const currentChoice = model[this.props.optionKey]

    return (
      <Row className="align-items-center pb-2" key={this.props.index}>
        <Col sm={5}>
          <Form.Label htmlFor="options-dropdown">
            {option.title}
          </Form.Label>
        </Col>

        <Col sm={7}>
          <Select
            value={{value: currentChoice, label: currentChoice}}
            onChange={(choice) => {
              const value = choice.value
              let attrs = {}
              attrs[this.props.optionKey] = value
              this.props.onChange(attrs)
            }}
            options={option.choices.map((choice) => {
              return { value: choice, label: choice}
            })}
            />
        </Col>
      </Row>
    )
  }
}

export default DropdownOption
