import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  Card
} from 'react-bootstrap'
import Select from 'react-select'

import {
  setCurrentShape,
} from '../shapes/shapesSlice'
import Shape from './Shape'
import {
  getShapesSelector,
  getCurrentShapeSelector
} from './selectors'

const mapStateToProps = (state, ownProps) => {
  return {
    currentShape: getCurrentShapeSelector(state),
    shapes: getShapesSelector(state)
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    setCurrentShape: (selected) => {
      dispatch(setCurrentShape(selected.value))
    },
  }
}

const customStyles = {
  control: base => ({
    ...base,
    height: 55,
    minHeight: 55
  })
}

class ShapeList extends Component {
  render() {
    const options = this.props.shapes.map(shape => {
      return { value: shape.id, label: shape.name }
    })
    const selectedOption = {
      value: this.props.currentShape.id,
      label: this.props.currentShape.name
    }

    return (
      <div>
        <Card className="p-3">
          <h4>Customize shape</h4>

          <Select
            value={selectedOption}
            onChange={this.props.setCurrentShape}
            styles={customStyles}
            maxMenuHeight={305}
            options={options} />

          <Shape key={this.props.currentShape.id} id={this.props.currentShape.id} />
        </Card>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ShapeList)
