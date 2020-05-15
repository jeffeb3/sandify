import { connect } from 'react-redux'
import React, { Component } from 'react'
import {
  Button,
} from 'react-bootstrap'
import InputOption from '../../components/InputOption'
import DropdownOption from '../../components/DropdownOption'
import CheckboxOption from '../../components/CheckboxOption'
import Transforms from '../transforms/Transforms'
import { updateShape } from './shapesSlice'
import {
  getShape,
  getShapeById,
  getCurrentShapeSelector
} from './selectors'
import './Shape.css'

const mapStateToProps = (state, ownProps) => {
  const shape = getCurrentShapeSelector(state)
  const metashape = getShape(shape)

  return {
    shape: shape,
    options: metashape.getOptions(),
    link: metashape.link,
    linkText: metashape.linkText
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const { id } = ownProps
  const metashape = getShapeById(id)

  return {
    onChange: (attrs) => {
      attrs.id = id
      dispatch(updateShape(attrs))
    },
    onRestoreDefaults: (event) => {
      let attrs = metashape.getInitialState()
      attrs.id = id

      dispatch(updateShape(attrs))
    }
  }
}

class Shape extends Component {
  render() {
    const optionsRender = Object.keys(this.props.options).map((key, index) => {
      const option = this.props.options[key]

      if (option.type === 'dropdown') {
        return  <DropdownOption
                  onChange={this.props.onChange}
                  options={this.props.options}
                  optionKey={key}
                  key={key}
                  index={index}
                  model={this.props.shape} />
      } else if (option.type === 'checkbox') {
        return <CheckboxOption
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
      const linkText = this.props.linkText || this.props.link
      const linkRender = this.props.link ? <p className="mb-3">See <a target="_blank" rel="noopener noreferrer" href={this.props.link}>{linkText}</a> for ideas.</p> : undefined

      optionsListRender =
        <div className="shape-options">
          {linkRender}
          {optionsRender}
        </div>
    }

    return (
      <div className="pt-1">
        <div className="d-flex align-items-center pt-1 pb-3">
          <Button variant="outline-primary" size="sm" onClick={this.props.onRestoreDefaults}>Restore defaults</Button>
        </div>
        { optionsListRender }
        { this.props.shape.canTransform && <Transforms id={this.props.shape.id} />}
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Shape)
