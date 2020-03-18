import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Accordion
} from 'react-bootstrap'
import {
  setCurrentShape,
} from './shapeSlice'
import { registeredShapes } from './registered_shapes.js'
import Shape from './Shape'

const mapState = (state, ownProps) => {
  return {
    current_shape: state.shapes.current_shape,
  }
}

const mapDispatch = (dispatch, ownProps) => {
  return {
    setCurrentShape: (name) => {
      dispatch(setCurrentShape(name));
    },
  }
}

class ShapeList extends Component {
  render() {
    var shapeRender = registeredShapes.map((shape, index) => {
      let shapeInfo = shape.getInfo(this)
      return <Shape
               key={shapeInfo.name}
               name={shapeInfo.name}
               active={shapeInfo.name === this.props.current_shape}
               link={shapeInfo.link || ""}
               index={index}
               options={shapeInfo.options}
               clicked={() => { this.props.setCurrentShape(shapeInfo.name); }} />
    })

    return (
      <div>
        <Accordion defaultActiveKey={0}>
          {shapeRender}
        </Accordion>
      </div>
    )
  }
}

export default connect(mapState, mapDispatch)(ShapeList)
