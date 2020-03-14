import React, { Component } from 'react';
import {
  Col,
  ControlLabel,
  Form,
  FormControl,
  FormGroup,
  ListGroupItem,
  Panel,
} from 'react-bootstrap'
import { connect } from 'react-redux';
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
    var activeClassName = "";
    if (this.props.active) {
      activeClassName = "active";
    }

    var activeGrowClassName = "";
    if (this.props.activeGrow) {
      activeGrowClassName = "active";
    }

    return (
      <div className="track">
        <ListGroupItem header="Track" className={activeClassName} onClick={this.props.activeCallback}>Moves the shape along a track (shown in green)</ListGroupItem>
        <div className="track-options">
          <Panel className="options-panel" collapsible expanded={this.props.active}>
            <Form horizontal>
              <FormGroup controlId="track-size">
                <Col componentClass={ControlLabel} sm={4}>
                  Track Size
                </Col>
                <Col sm={8}>
                  <FormControl type="number" value={this.props.value} onChange={this.props.onChange} onKeyDown={disableEnter}/>
                </Col>
              </FormGroup>
              <FormGroup controlId="track-length">
                <Col componentClass={ControlLabel} sm={4}>
                  Track Length
                </Col>
                <Col sm={8}>
                  <FormControl type="number" value={this.props.length} step="0.05" onChange={this.props.onChangeLength} onKeyDown={disableEnter}/>
                </Col>
              </FormGroup>
              <ListGroupItem header="Grow" className={activeGrowClassName} onClick={this.props.activeGrowCallback}>Grows or shrinks the track a little bit for each step</ListGroupItem>
              <div className="scale-options">
                <Panel className="options-panel" collapsible expanded={this.props.activeGrow}>
                    <FormGroup controlId="scale-step">
                      <Col componentClass={ControlLabel} sm={4}>
                        Track Grow Step
                      </Col>
                      <Col sm={8}>
                        <FormControl type="number" value={this.props.trackGrow} onChange={this.props.onChangeGrow} onKeyDown={disableEnter}/>
                      </Col>
                    </FormGroup>
                </Panel>
              </div>
            </Form>
          </Panel>
        </div>
      </div>
    )
  }
}
export default connect(mapState, mapDispatch)(TrackTransform)
