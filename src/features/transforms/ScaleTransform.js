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
  toggleGrow,
  setGrow
} from './transformsSlice'

const mapState = (state, ownProps) => {
  return {
    active: state.transform.growEnabled,
    value: state.transform.growValue,
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
    var activeClassName = "";
    if (this.props.active) {
      activeClassName = "active";
    }

    return (
      <div className="scale">
        <ListGroupItem header="Grow" className={activeClassName} onClick={this.props.activeCallback}>Grows or shrinks the input shape a little bit for each copy</ListGroupItem>
        <div className="scale-options">
          <Panel className="options-panel" collapsible expanded={this.props.active}>
            <Form horizontal>
              <FormGroup controlId="scale-step">
                <Col componentClass={ControlLabel} sm={4}>
                  Grow Step
                </Col>
                <Col sm={8}>
                  <FormControl type="number" value={this.props.value} onChange={this.props.onChange} onKeyDown={disableEnter}/>
                </Col>
              </FormGroup>
            </Form>
          </Panel>
        </div>
      </div>
    )
  }
}
export default connect(mapState, mapDispatch)(ScaleTransform)
