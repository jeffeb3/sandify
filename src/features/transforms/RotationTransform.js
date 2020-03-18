import React, { Component } from 'react'
import {
  Col,
  ControlLabel,
  Form,
  FormControl,
  FormGroup,
  ListGroupItem,
  Panel,
} from 'react-bootstrap'
import { connect } from 'react-redux'
import { disableEnter } from '../shapes/Shape'
import {
  toggleSpin,
  setSpin,
  setSpinSwitchbacks,
} from './transformsSlice'

const mapState = (state, ownProps) => {
  return {
    active: state.transform.spinEnabled,
    value: state.transform.spinValue,
    switchbacks: state.transform.spinSwitchbacks,
  }
}

const mapDispatch = (dispatch, ownProps) => {
  return {
    activeCallback: () => {
      dispatch(toggleSpin());
    },
    onChange: (event) => {
      dispatch(setSpin(event.target.value));
    },
    onSwitchbacksChange: (event) => {
      dispatch(setSpinSwitchbacks(event.target.value));
    },
  }
}

class RotationTransform extends Component {
  render() {
    var activeClassName = "";
    if (this.props.active) {
      activeClassName = "active";
    }

    return (
      <div className="rotate">
        <ListGroupItem header="Spin" className={activeClassName} onClick={this.props.activeCallback}>Spins the input shape a little bit for each copy</ListGroupItem>
        <div className="rotate-options">
          <Panel className="options-panel" collapsible expanded={this.props.active}>
            <Form horizontal>
              <FormGroup controlId="rotate-step">
                <Col componentClass={ControlLabel} sm={4}>
                  Spin Step (Can be Negative)
                </Col>
                <Col sm={8}>
                  <FormControl type="number" step="0.1" value={this.props.value} onChange={this.props.onChange} onKeyDown={disableEnter}/>
                </Col>
              </FormGroup>
              <FormGroup controlId="rotate-switchbacks">
                <Col componentClass={ControlLabel} sm={4}>
                  Switchbacks
                </Col>
                <Col sm={8}>
                  <FormControl type="number" step="1" value={this.props.switchbacks} onChange={this.props.onSwitchbacksChange} onKeyDown={disableEnter}/>
                </Col>
              </FormGroup>
            </Form>
          </Panel>
        </div>
      </div>
    )
  }
}

export default connect(mapState, mapDispatch)(RotationTransform)
