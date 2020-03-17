import React, { Component } from 'react'
import {
  Col,
  Row,
  Accordion,
  FormControl,
  Form,
  Card,
} from 'react-bootstrap'
import { connect } from 'react-redux'
import { disableEnter } from '../shapes/Shape'
import {
  toggleGrow,
  setGrow
} from './transformsSlice'

const mapState = (state, ownProps) => {
  return {
    active: state.transform.grow_enabled,
    value: state.transform.grow_value,
  }
}

const mapDispatch = (dispatch, ownProps) => {
  return {
    activeCallback: () => {
      dispatch(toggleGrow());
    },
    onChange: (event) => {
      dispatch(setGrow(event.target.value));
    },
  }
}

class ScaleTransform extends Component {
  render() {
    var activeClassName = this.props.active ? 'active' : ''
    var activeKey = this.props.active ? 0 : null

    return (
      <Accordion defaultActiveKey={activeKey}>
        <Card className={`${activeClassName} overflow-auto`}>
          <Accordion.Toggle as={Card.Header} eventKey={0} onClick={this.props.activeCallback}>
            <h4>Grow</h4>
            Grows or shrinks the input shape a little bit for each copy
          </Accordion.Toggle>

          <Accordion.Collapse eventKey={0}>
            <Card.Body>
              <Row className="align-items-center pb-2">
                <Col sm={4}>
                  <Form.Label htmlFor="scale-step">
                    Grow step
                  </Form.Label>
                </Col>

                <Col sm={8}>
                  <FormControl id="scale-step" type="number" value={this.props.value} onChange={this.props.onChange} onKeyDown={disableEnter} />
                </Col>
              </Row>
            </Card.Body>
          </Accordion.Collapse>
        </Card>
      </Accordion>
    )
  }
}
export default connect(mapState, mapDispatch)(ScaleTransform)
