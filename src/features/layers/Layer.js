import { connect } from 'react-redux'
import React, { Component } from 'react'
import { Button, Card, Row, Col } from 'react-bootstrap'
import Select from 'react-select'
import CommentsBox from '../../components/CommentsBox'
import InputOption from '../../components/InputOption'
import DropdownOption from '../../components/DropdownOption'
import CheckboxOption from '../../components/CheckboxOption'
import ImageOption from '../../components/ImageOption'
import Transforms from '../transforms/Transforms'
import { updateLayer, setShapeType, restoreDefaults } from '../layers/layersSlice'
import { getCurrentLayer } from './selectors'
import { getShape, getShapeSelectOptions } from '../../models/shapes'
import './Layer.scss'

const mapStateToProps = (state, ownProps) => {
  const layer = getCurrentLayer(state)
  const shape = getShape(layer)

  return {
    layer: layer,
    shape: shape,
    options: shape.getOptions(),
    selectOptions: getShapeSelectOptions(),
    showShapeSelectRender: layer.selectGroup !== "import",
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

class Layer extends Component {
  render() {
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
      } else if (option.type === 'comments') {
        return <CommentsBox
                  options={this.props.options}
                  optionKey={key}
                  key={key}
                  comments={this.props.layer.comments} />
      } else if (option.type === 'file') {
        return <ImageOption
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
                  model={this.props.layer} />
      }
    })

    const linkText = this.props.linkText || this.props.link
    const linkRender = this.props.link ? <Row><Col sm={5}></Col><Col sm={7}><p className="mt-2">See <a target="_blank" rel="noopener noreferrer" href={this.props.link}>{linkText}</a> for ideas.</p></Col></Row> : undefined
    let optionsListRender = undefined

    if (Object.entries(this.props.options).length > 0) {
      optionsListRender =
        <div className="m-0">
          {optionsRender}
        </div>
    }

    let shapeSelectRender = undefined

    if (this.props.showShapeSelectRender) {
      shapeSelectRender =
        <Row className="align-items-center">
          <Col sm={5}>
            Shape
          </Col>

          <Col sm={7}>
            <Select
              value={selectedOption}
              onChange={this.props.onChangeType}
              maxMenuHeight={305}
              options={this.props.selectOptions} />
          </Col>
        </Row>
    }

    return (
      <Card className="p-3 overflow-auto flex-grow-1" style={{borderTop: "1px solid #aaa", borderBottom: "none"}}>
        <Row className="align-items-center mb-2">
          <Col sm={5}>
            <h2 className="panel m-0">Properties</h2>
          </Col>
          <Col sm={7}>
            <Button className="ml-auto" variant="outline-primary" size="sm" onClick={this.props.onRestoreDefaults}>Restore defaults</Button>
          </Col>
        </Row>

        { shapeSelectRender }

        { linkRender }

        <div className="pt-1">
          { optionsListRender }
          { this.props.layer.canTransform && <Transforms id={this.props.layer.id} />}
        </div>
      </Card>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Layer)
