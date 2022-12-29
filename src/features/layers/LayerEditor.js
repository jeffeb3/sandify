import { connect } from 'react-redux'
import React, { Component } from 'react'
import { Button, Card, Row, Col } from 'react-bootstrap'
import Select from 'react-select'
import CommentsBox from '../../components/CommentsBox'
import InputOption from '../../components/InputOption'
import DropdownOption from '../../components/DropdownOption'
import CheckboxOption from '../../components/CheckboxOption'
import ToggleButtonOption from '../../components/ToggleButtonOption'
import SortableEffects from './SortableEffects'
import NewEffect from './NewEffect'
import { updateLayer, updateShape, updateEffect, setShapeType, restoreDefaults } from '../layers/layersSlice'
import { getCurrentLayerState, getCurrentLayerId, getCurrentEffectState, getCurrentEffectsStates, getCurrentLayerNumEffects } from './layersSlice'
import { getModelFromLayer, getShapeSelectOptions } from '../../config/models'
import { getEffectModel } from '../../config/effects'
import { layerOptions } from '../../models/Layer'
import { FaPlusSquare, FaTrash, FaCopy} from 'react-icons/fa'
import { MdOutlineFileUpload } from 'react-icons/md'
import './LayerEditor.scss'

const mapStateToProps = (state, ownProps) => {
  const layer = getCurrentLayerState(state)
  const shape = getModelFromLayer(layer)
  const effectState = getCurrentEffectState(state)
  const effectModel = effectState ? getEffectModel(effectState) : undefined
  const effectOptions = effectModel ? effectModel.getOptions() : []

  return {
    layer: layer,
    shape: shape,
    shapeOptions: shape.getOptions(),
    layerOptions: layerOptions,
    selectOptions: getShapeSelectOptions(),
    effectState: effectState,
    effects: getCurrentEffectsStates(state), // lists of effect options?
    effectOptions: effectOptions,
    numEffects: getCurrentLayerNumEffects(state),
    showShapeSelectRender: layer.selectGroup !== 'import' && !layer.effect,
    link: shape.link,
    linkText: shape.linkText
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const { id } = ownProps

  return {
    onChangeLayer: (attrs) => {
      attrs.id = id
      dispatch(updateLayer(attrs))
    },
    onChangeShape: (attrs) => {
      attrs.id = id
      dispatch(updateShape(attrs))
    },
    onChangeEffect: (attrs) => {
      // Doesn't work. How do I get state here?
      attrs.id = effectState.id
      console.log(attrs)
      dispatch(updateEffect(attrs))
    },
    onChangeType: (selected) => {
      dispatch(setShapeType({id: id, type: selected.value}))
    },
    onRestoreDefaults: (event) => {
      dispatch(restoreDefaults(id))
    }
  }
}

// Should be LayerEditor or something
class LayerEditor extends Component {
  constructor(props) {
    super(props)

    this.state = {
      showNewEffect: false,
      showCopyEffect: false
    }
  }
  render() {
    const selectedOption = { value: this.props.shape.id, label: this.props.shape.type }
    const shapeOptionsRender = Object.keys(this.props.shapeOptions).map((key, index) => {
      return this.getOptionComponent(key, index, this.props.shapeOptions, this.props.layer.shape, this.props.onChangeShape)
    })
    const layerOptionsRender = Object.keys(this.props.layerOptions).map((key, index) => {
      return this.getOptionComponent(key, index, this.props.layerOptions, this.props.layer, this.props.onChangeLayer)
    })
    const effectOptionsRender = Object.keys(this.props.effectOptions).map((key, index) => {
      return this.getOptionComponent(key, index, this.props.effectOptions, this.props.effectState, this.props.onChangeEffect)
    })

    const linkText = this.props.linkText || this.props.link
    const linkRender = this.props.link ? <Row><Col sm={5}></Col><Col sm={7}><p className="mt-2">See <a target="_blank" rel="noopener noreferrer" href={this.props.link}>{linkText}</a> for ideas.</p></Col></Row> : undefined
    let shapeOptionsListRender = undefined

    if (Object.entries(this.props.shapeOptions).length > 0) {
      shapeOptionsListRender =
        <div className="m-0">
          {shapeOptionsRender}
          {layerOptionsRender}
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

    const canRemoveEffect = this.props.numEffects > 0
    const canCopyEffect = this.props.numEffects > 0

    return (
      <div>
        <NewEffect
          showModal={this.state.showNewEffect}
          toggleModal={this.toggleNewEffectModal.bind(this)}
        />
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
            { shapeOptionsListRender }
          </div>

          <Card className="p-3 overflow-auto flex-grow-1" style={{borderTop: "1px solid #aaa", borderBottom: "none"}}>
            <h2 className="panel">Effects ({this.props.numEffects})</h2>
            <SortableEffects
              pressDelay={150}
              //onSortEnd={onLayerMoved}
              //updateBeforeSortStart={onSortStarted}
              lockAxis="y"
              {...this.props}
            />
            <div className="d-flex align-items-center border-left border-right border-bottom">
              <Button
                className="ml-2 layer-button"
                variant="light"
                size="sm"
                data-tip="Create new layer"
                onClick={this.toggleNewEffectModal.bind(this)}
              >
                <FaPlusSquare />
              </Button>
              <div className="ml-auto">
                {canRemoveEffect && <Button
                  className="layer-button"
                  variant="light"
                  data-tip="Delete layer"
                  //onClick={onLayerRemoved.bind(this, currentLayer.id)}
                >
                  <FaTrash />
                </Button>}
                {canCopyEffect && <Button
                  className="layer-button"
                  variant="light"
                  data-tip="Copy layer"
                  onClick={this.toggleCopyEffectModal.bind(this)}
                >
                  <FaCopy />
                </Button>}
              </div>
            </div>
            <div className="m-0">
              {effectOptionsRender}
            </div>
          </Card>
        </Card>
      </div>
    )
  }

  getOptionComponent(key, index, options, model, onChangeMethod) {
    const option = options[key]

    if (option.type === 'dropdown') {
      return  <DropdownOption
                onChange={onChangeMethod}
                options={options}
                optionKey={key}
                key={key}
                index={index}
                model={model} />
    } else if (option.type === 'checkbox') {
      return  <CheckboxOption
                onChange={onChangeMethod}
                options={options}
                optionKey={key}
                key={key}
                index={index}
                model={model} />
    } else if (option.type === 'comments') {
      return  <CommentsBox
                options={options}
                optionKey={key}
                key={key}
                comments={model.comments} />
    } else if (option.type === 'togglebutton') {
      return  <ToggleButtonOption
                onChange={onChangeMethod}
                options={options}
                optionKey={key}
                key={key}
                index={index}
                model={model} />
    } else {
      return  <InputOption
                onChange={onChangeMethod}
                options={options}
                optionKey={key}
                key={key}
                index={index}
                model={model} />
    }
  }

  toggleNewEffectModal() {
    this.setState({showNewEffect: !this.state.showNewEffect})
  }

  toggleCopyEffectModal() {
    this.setState({showCopyEffect: !this.state.showCopyEffect})
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LayerEditor)
