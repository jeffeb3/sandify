import { connect } from 'react-redux'
import React, { Component } from 'react'
import {
  Col,
  Form,
  Card,
  Accordion,
  Dropdown,
  Row
} from 'react-bootstrap'
import {
  setCurrentShape,
} from './shapeSlice'
import { registeredShapes } from './registered_shapes.js'
import './Shape.css'

export const disableEnter = (event) => {
  if (event.key === 'Enter' && event.shiftKey === false) {
    event.preventDefault();
  }
}

const mapState = (state, ownProps) => {
  let props = {
    current_shape: state.shapes.current_shape,
    starting_size: state.transform.starting_size,
    x_offset: state.transform.offset_x,
    y_offset: state.transform.offset_y,
  };

  let registeredProps = registeredShapes.map((shape) => shape.mapState(state, ownProps));
  return Object.assign(props, ...registeredProps);
}

const mapDispatch = (dispatch, ownProps) => {
  let methods = {
    setCurrentShape: (name) => {
      dispatch(setCurrentShape(name));
    },
  };
  let registeredMethods = registeredShapes.map((shape) => shape.mapDispatch(dispatch, ownProps));

  return Object.assign(methods, ...registeredMethods);
}

class Shape extends Component {
  render() {
    var activeClassName = this.props.active ? 'active' : ''
    var optionsRender = this.props.options.map( (option) => {
      if (option.type && option.type === "dropdown") {
        return <Row className="align-items-center pb-2">
                <Col sm={4}>
                  <Form.Label htmlFor="options-dropdown">
                    {option.title}
                  </Form.Label>
                </Col>

                <Col sm={8}>
                  <Dropdown
                    id="options-dropdown"
                    flip={true}
                    onSelect={(event) => {
                       option.onChange(this.props)(event);
                    }}
                    onKeyDown={disableEnter}>
                    <Dropdown.Toggle variant="secondary">
                      {option.value(this.props)}
                     </Dropdown.Toggle>

                    <Dropdown.Menu>
                      {option.choices.map((choice) => {
                         return <Dropdown.Item key={choice} eventKey={choice}>{choice}</Dropdown.Item>
                      })}
                    </Dropdown.Menu>
                  </Dropdown>
                </Col>
               </Row>
      } else {
        return  <Row className="align-items-center pb-2">
                  <Col sm={4}>
                    <Form.Label htmlFor="options-step">
                      {option.title}
                    </Form.Label>
                  </Col>

                  <Col sm={8}>
                    <Form.Control
                      id="options-step"
                      type={option.type ? option.type : "number"}
                      step={option.step ? option.step : 1}
                      value={option.value(this.props)}
                      onChange={(event) => {
                        option.onChange(this.props)(event)
                      }}
                      onKeyDown={disableEnter} />
                 </Col>
                </Row>
      }
    })

    var optionsListRender = undefined
    var linkRender = undefined
    var cardBodyRender = <div></div>

    if (this.props.link) {
      linkRender = <p className="mb-0 mt-3">See <a target="_blank" rel="noopener noreferrer" href={this.props.link}>{this.props.link}</a> for ideas.</p>;
    }

    if (this.props.options.length >= 1) {
      optionsListRender =
        <div className="shape-options">
          {optionsRender}
          {linkRender}
        </div>
    }

    if (this.props.options.length > 0) {
      cardBodyRender =
        <Card.Body>
          {optionsListRender}
        </Card.Body>
    }

    return (
      <Card className={`${activeClassName} overflow-auto`}>
        <Accordion.Toggle as={Card.Header} eventKey={this.props.index} onClick={this.props.clicked}>{this.props.name}</Accordion.Toggle>
        <Accordion.Collapse eventKey={this.props.index}>
          { cardBodyRender }
        </Accordion.Collapse>
      </Card>
    )
  }
}

export default connect(mapState, mapDispatch)(Shape)
