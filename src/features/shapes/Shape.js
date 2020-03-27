import { connect } from 'react-redux'
import React, { Component } from 'react'
import InputOption from '../../components/InputOption'
import DropdownOption from '../../components/DropdownOption'
import Transforms from '../transforms/Transforms'
import { updateShape } from './shapesSlice'
import {
  getShape,
  getCurrentShapeSelector
} from './selectors'
import './Shape.css'

const mapStateToProps = (state, ownProps) => {
  const shape = getCurrentShapeSelector(state)
  const metashape = getShape(shape)

  return {
    shape: shape,
    options: metashape.getOptions(),
    link: metashape.link
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const { id } = ownProps

  return {
    onChange: (attrs) => {
      attrs.id = id
      dispatch(updateShape(attrs))
    }
  }
}

class Shape extends Component {
  render() {
    const optionsRender = Object.keys(this.props.options).map((key, index) => {
      const option = this.props.options[key]

      if (option.type && option.type === "dropdown") {
        return  <DropdownOption
                  onChange={this.props.onChange}
                  options={this.props.options}
                  optionKey={key}
                  key={key}
                  index={index}
                  model={this.props.shape} />
      } else {
        return  <InputOption
                  onChange={this.props.onChange}
                  options={this.props.options}
                  optionKey={key}
                  key={key}
                  index={index}
                  model={this.props.shape} />
      }
    })

    let optionsListRender = undefined
    if (Object.entries(this.props.options).length > 0) {
      const linkRender = this.props.link ? <p className="mb-3">See <a target="_blank" rel="noopener noreferrer" href={this.props.link}>{this.props.link}</a> for ideas.</p> : undefined

      optionsListRender =
        <div className="shape-options">
          {linkRender}
          {optionsRender}
        </div>
    }

    return (
      <div className="pt-4">
        { optionsListRender }
        <Transforms id={this.props.shape.id} />
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Shape)
