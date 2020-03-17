import React, { Component } from 'react'
import {
  Accordion,
  Col,
  Row,
  Form,
  FormControl,
  Card,
} from 'react-bootstrap'
import { connect } from 'react-redux'
import { disableEnter } from '../shapes/Shape'
import {
  toggleTrack,
  toggleTrackGrow,
  setTrack,
  setTrackLength,
  setTrackGrow
} from './transformsSlice'

const mapState = (state, ownProps) => {
  return {
    active: state.transform.trackEnabled,
    activeGrow: state.transform.trackGrowEnabled,
    value: state.transform.trackValue,
    length: state.transform.trackLength,
    trackGrow: state.transform.trackGrow,
  }
}

const mapDispatch = (dispatch, ownProps) => {
  return {
    activeCallback: () => {
      dispatch(toggleTrack());
    },
    activeGrowCallback: () => {
      dispatch(toggleTrackGrow());
    },
    onChange: (event) => {
      dispatch(setTrack(event.target.value));
    },
    onChangeLength: (event) => {
      dispatch(setTrackLength(event.target.value));
    },
    onChangeGrow: (event) => {
      dispatch(setTrackGrow(event.target.value));
    },
  }
}

class TrackTransform extends Component {
  render() {
    var activeClassName = this.props.active ? 'active' : ''
    var activeKey = this.props.active ? 0 : null
    var activeGrowClassName = this.props.activeGrow ? 'active' : ''
    var activeGrowKey = this.props.activeGrow ? 0 : null

    return (
      <Accordion defaultActiveKey={activeKey}>
        <Card className={`${activeClassName} overflow-auto`}>
          <Accordion.Toggle as={Card.Header} eventKey={0} onClick={this.props.activeCallback}>
            <h4>Track</h4>
            Moves the shape along a track (shown in green)
          </Accordion.Toggle>

          <Accordion.Collapse eventKey={0}>
            <Card.Body>
              <Row className="align-items-center pb-2">
                <Col sm={4}>
                  <Form.Label htmlFor="track-size">
                    Track Size
                  </Form.Label>
                </Col>
                <Col sm={8}>
                  <FormControl id="track-size" type="number" value={this.props.value} onChange={this.props.onChange} onKeyDown={disableEnter} />
                </Col>
              </Row>

              <Row className="align-items-center pb-2">
                <Col sm={4}>
                  <Form.Label htmlFor="track-length">
                    Track Length
                  </Form.Label>
                </Col>
                <Col sm={8}>
                  <FormControl id="track-length" type="number" value={this.props.length} step="0.05" onChange={this.props.onChangeLength} onKeyDown={disableEnter} />
                </Col>
              </Row>

              <Accordion defaultActiveKey={activeGrowKey} className="mt-3">
                <Card className={`${activeGrowClassName} overflow-auto`}>
                  <Accordion.Toggle as={Card.Header} eventKey={0} onClick={this.props.activeGrowCallback}>
                    <h4>Grow</h4>
                    Grows or shrinks the track a little bit for each step
                  </Accordion.Toggle>

                  <Accordion.Collapse eventKey={0}>
                    <Card.Body>
                      <Row className="align-items-center pb-2">
                        <Col sm={4}>
                          <Form.Label htmlFor="scale-step">
                            Track Grow Step
                          </Form.Label>
                        </Col>

                        <Col sm={8}>
                          <FormControl id="scale-step" type="number" value={this.props.trackGrow} onChange={this.props.onChangeGrow} onKeyDown={disableEnter} />
                        </Col>
                      </Row>
                    </Card.Body>
                  </Accordion.Collapse>
                </Card>
              </Accordion>
            </Card.Body>
          </Accordion.Collapse>
        </Card>
      </Accordion>
    )
  }
}
export default connect(mapState, mapDispatch)(TrackTransform)
