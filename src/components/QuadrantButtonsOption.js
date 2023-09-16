import React from "react"
import Col from "react-bootstrap/Col"
import Row from "react-bootstrap/Row"
import Form from "react-bootstrap/Form"
import ToggleButton from "react-bootstrap/ToggleButton"
import ToggleButtonGroup from "react-bootstrap/ToggleButtonGroup"

const QuadrantButtonsOption = (props) => {
  const option = props.options[props.optionKey]
  const { data } = props
  const value = data[props.optionKey]

  const handleChange = (choices) => {
    let attrs = {}
    attrs[props.optionKey] = choices[choices.length - 1]
    props.onChange(attrs)
  }

  return (
    <Row className="align-items-center">
      <Col
        sm={5}
        className="mb-1"
      >
        <Form.Label className="m-0">{option.title}</Form.Label>
      </Col>

      <Col
        sm={7}
        className="mb-1"
      >
        <div className="border p-1">
          <ToggleButtonGroup
            id="origin-bar"
            type="checkbox"
            name="origin"
            className="flex-wrap"
            value={value}
            onChange={handleChange}
          >
            <ToggleButton
              variant="light"
              value={1}
              id="origin-upper-left"
              className="px-4"
              style={{ borderRadius: 0 }}
            >
              upper left
            </ToggleButton>
            <ToggleButton
              variant="light"
              value={2}
              id="origin-upper-right"
              className="px-4"
              style={{ borderRadius: 0 }}
            >
              upper right
            </ToggleButton>
            <ToggleButton
              variant="light"
              value={0}
              id="origin-lower-left"
              className="px-4"
              style={{ borderRadius: 0 }}
            >
              lower left
            </ToggleButton>
            <ToggleButton
              variant="light"
              value={3}
              id="origin-lower-right"
              className="px-4"
              style={{ borderRadius: 0 }}
            >
              lower right
            </ToggleButton>
          </ToggleButtonGroup>
        </div>
      </Col>
    </Row>
  )
}

export default QuadrantButtonsOption
