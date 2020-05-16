import { connect } from 'react-redux'
import React, { Component } from 'react'
import { Button, Card } from 'react-bootstrap'
import Select from 'react-select'
import InputOption from '../../components/InputOption'
import DropdownOption from '../../components/DropdownOption'
import CheckboxOption from '../../components/CheckboxOption'
import Transforms from '../transforms/Transforms'
import { updateLayer, setShapeType, restoreDefaults } from '../layers/layersSlice'
import { getCurrentLayer } from './selectors'
import { getShape, getShapeDefaults } from '../../models/shapes'

const mapStateToProps = (state, ownProps) => {
  const layer = getCurrentLayer(state)
  const shape = getShape(layer)
  const shapes = getShapeDefaults()

  return {
    layer: layer,
    shape: shape,
    shapes: shapes,
    options: shape.getOptions(),
    link: shape.link,
    linkText: shape.linkText
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const { id } = ownProps

  return {
    onChange: (attrs) => {
      attrs.id = id
      dispatch(updateLayer(attrs))
    },
    onChangeType: (selected) => {
      dispatch(setShapeType({id: id, type: selected.value}))
    },
    onRestoreDefaults: (event) => {
      dispatch(restoreDefaults(id))
    }
  }
}

const customStyles = {
  control: base => ({
    ...base,
    height: 55,
    minHeight: 55
  })
}

class Layer extends Component {
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

    const selectedOption = { value: this.props.shape.id, label: this.props.shape.name }
    const optionsRender = Object.keys(this.props.options).map((key, index) => {
      const option = this.props.options[key]

      if (option.type === 'dropdown') {
        return  <DropdownOption
                  onChange={this.props.onChange}
                  options={this.props.options}
                  optionKey={key}
                  key={key}
                  index={index}
                  model={this.props.layer} />
      } else if (option.type === 'checkbox') {
        return <CheckboxOption
                  onChange={this.props.onChange}
                  options={this.props.options}
                  optionKey={key}
                  key={key}
                  index={index}
                  model={this.props.layer} />
      } else {
        return  <InputOption
                  onChange={this.props.onChange}
                  options={this.props.options}
                  optionKey={key}
                  key={key}
                  index={index}
                  model={this.props.layer} />
      }
    })

    let optionsListRender = undefined
    if (Object.entries(this.props.options).length > 0) {
      const linkText = this.props.linkText || this.props.link
      const linkRender = this.props.link ? <p className="mb-3">See <a target="_blank" rel="noopener noreferrer" href={this.props.link}>{linkText}</a> for ideas.</p> : undefined

      optionsListRender =
        <div className="m-0">
          {linkRender}
          {optionsRender}
        </div>
    }

    return (
      <Card className="p-3 border-0">
        <Select
          value={selectedOption}
          onChange={this.props.onChangeType}
          styles={customStyles}
          maxMenuHeight={305}
          options={groupOptions} />

        <div className="pt-1">
          <div className="d-flex align-items-center pt-1 pb-3">
            <Button variant="outline-primary" size="sm" onClick={this.props.onRestoreDefaults}>Restore defaults</Button>
          </div>
          { optionsListRender }
          { this.props.layer.canTransform && <Transforms id={this.props.layer.id} />}
        </div>
      </Card>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Layer)
