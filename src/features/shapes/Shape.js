import { connect } from 'react-redux'
import React, { Component } from 'react'
import {
  Col,
  ControlLabel,
  Form,
  FormControl,
  FormGroup,
  ListGroupItem,
  Panel,
  MenuItem,
  DropdownButton
} from 'react-bootstrap'
import {
  setXFormOffsetX,
  setXFormOffsetY,
} from '../transforms/transformsSlice'
import {
  setCurrentShape,
  setShapeStartingSize
} from './shapeSlice'
import { registeredShapes } from './registered_shapes.js'
import './Shape.css'

export const disableEnter = (event) => {
  if (event.key === 'Enter' && event.shiftKey === false) {
    event.preventDefault();
  }
};

const mapState = (state, ownProps) => {
  let props = {
    current_shape: state.shapes.current_shape,
    starting_size: state.shapes.starting_size,
    x_offset: state.transform.xformOffsetX,
    y_offset: state.transform.xformOffsetY,
  };

  let registeredProps = registeredShapes.map((shape) => shape.mapState(state, ownProps));
  return Object.assign(props, ...registeredProps);
}

const mapDispatch = (dispatch, ownProps) => {
  let methods = {
    setCurrentShape: (name) => {
      dispatch(setCurrentShape(name));
    },
    onSizeChange: (event) => {
      dispatch(setShapeStartingSize(event.target.value));
    },
    onOffsetXChange: (event) => {
      dispatch(setXFormOffsetX(event.target.value));
    },
    onOffsetYChange: (event) => {
      dispatch(setXFormOffsetY(event.target.value));
    },
  };
  let registeredMethods = registeredShapes.map((shape) => shape.mapDispatch(dispatch, ownProps));

  return Object.assign(methods, ...registeredMethods);
}

class Shape extends Component {
  render() {
    var activeClassName = "";
    if (this.props.active) {
      activeClassName = "active";
    }

    var options_render = this.props.options.map( (option) => {
      if (option.type && option.type === "dropdown") {
        return <FormGroup controlId="options-step" key={option.title}>
                 <Col componentClass={ControlLabel} sm={4}>
                   {option.title}
                 </Col>
                 <Col sm={8}>
                   <DropdownButton bsStyle="default"
                                   id="dropdown-basic-button"
                                   title={option.value(this.props)}
                                   onSelect={(event) => {
                                       option.onChange(this.props)(event);
                                   }}
                                   onKeyDown={disableEnter}>
                     {option.choices.map((choice) => {
                         return <MenuItem key={choice} eventKey={choice}>{choice}</MenuItem>;
                     })}
                   </DropdownButton>
                 </Col>
               </FormGroup>
      } else {
        return <FormGroup controlId="options-step" key={option.title}>
                 <Col componentClass={ControlLabel} sm={4}>
                   {option.title}
                 </Col>
                 <Col sm={8}>
                   <FormControl
                     type={option.type ? option.type : "number"}
                     step={option.step ? option.step : 1}
                     value={option.value(this.props)}
                     onChange={(event) => {
                       option.onChange(this.props)(event)
                     }}
                     onKeyDown={disableEnter}/>
                 </Col>
               </FormGroup>
      }
    })

    var options_list_render = undefined;
    var link_render = undefined;

    if (this.props.link) {
      link_render = <p>See <a target="_blank" rel="noopener noreferrer" href={this.props.link}>{this.props.link}</a> for ideas</p>;
    }

    if (this.props.options.length >= 1) {
      options_list_render =
        <div className="shape-options">
          <Panel className="options-panel" collapsible expanded={this.props.active}>
            <Form horizontal>
              {link_render}
              {options_render}
            </Form>
          </Panel>
        </div>
    }

    return (
      <div className="shape">
        <ListGroupItem className={activeClassName} onClick={this.props.clicked}>{this.props.name}</ListGroupItem>
            {options_list_render}
      </div>
    )
  }
}

export default connect(mapState, mapDispatch)(Shape)
