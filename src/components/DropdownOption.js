import React, { Component } from 'react'
import {
  Col,
  Dropdown,
  Form,
  Row
} from 'react-bootstrap'

class DropdownOption extends Component {
  render() {
    const option = this.props.options[this.props.optionKey]
    const model = this.props.model

    return (
      <Row className="align-items-center pb-2" key={this.props.index}>
        <Col sm={4}>
          <Form.Label htmlFor="options-dropdown">
            {option.title}
          </Form.Label>
        </Col>

        <Col sm={8}>
          <Dropdown
            id="options-dropdown"
            onSelect={(value) => {
              let attrs = {}
              attrs[this.props.optionKey] = value
              this.props.onChange(attrs)
            }}>
            <Dropdown.Toggle variant="secondary">
              {model[this.props.optionKey]}
             </Dropdown.Toggle>

            <Dropdown.Menu>
              {option.choices.map((choice) => {
                 return <Dropdown.Item key={choice} eventKey={choice}>{choice}</Dropdown.Item>
              })}
            </Dropdown.Menu>
          </Dropdown>
        </Col>
      </Row>
    )
  }
}

export default DropdownOption
