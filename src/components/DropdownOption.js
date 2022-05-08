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

    let choices = option.choices
    if (typeof choices === 'function') {
      choices = choices()
    }

    choices = Array.isArray(choices) ?
      choices.map((choice) => {
        return { value: choice, label: choice }
      }) :
      Object.keys(choices).map((key) => {
        return { value: key, label: option.choices[key] }
      })

    const currentLabel = Array.isArray(choices) ?
      currentChoice :
      choices[currentChoice]

    return (
      <Row className="align-items-center pb-2" key={this.props.index}>
        <Col sm={5}>
          <Form.Label htmlFor="options-dropdown">
            {option.title}
          </Form.Label>
        </Col>

        <Col sm={7}>
          <Select
            value={{value: currentChoice, label: currentLabel}}
            onChange={(choice) => {
              const value = choice.value
              let attrs = {}
              attrs[this.props.optionKey] = value

              if (option.onChange !== undefined) {
                attrs = option.onChange(attrs, model)
              }

              this.props.onChange(attrs)
            }}
            options={choices}
            />
        </Col>
      </Row>
    )
  }
}

export default DropdownOption
