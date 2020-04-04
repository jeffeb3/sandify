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
    const groupOptions = []
    for (const shape of this.props.shapes) {
      const optionLabel = { value: shape.id, label: shape.name }
      var found = false
      for (const group of groupOptions) {
        if (group.label === shape.selectGroup) {
          found = true
          group.options.push(optionLabel)
        }
      }
      if (!found) {
        const newOptions = [ optionLabel ]
        groupOptions.push( { label: shape.selectGroup, options: newOptions } )
      }
    }

    const selectedOption = {
      value: this.props.currentShape.id,
      label: this.props.currentShape.name
    }

    return (
      <div>
        <Card className="p-3 border-0">
          <Select
            value={selectedOption}
            onChange={this.props.setCurrentShape}
            styles={customStyles}
            maxMenuHeight={305}
            options={groupOptions} />

          <Shape key={this.props.currentShape.id} id={this.props.currentShape.id} />
        </Card>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ShapeList)
