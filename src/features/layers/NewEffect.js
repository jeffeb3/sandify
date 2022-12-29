import React, { Component } from 'react'
import Select from 'react-select'
import { Button, Modal, Row, Col, Form } from 'react-bootstrap'
import { connect } from 'react-redux'

import { registeredEffectModels, getEffectSelectOptions, getEffectModel } from '../../config/effects'
import { addEffect, getCurrentLayerId } from './layersSlice'

// Initialize these from local storage, or reasonable defaults
const initialEffectType = localStorage.getItem('currentEffect') || 'loop'
const initialEffectName = getEffectModel({type: initialEffectType}).type.toLowerCase()

const customStyles = {
  control: base => ({
    ...base,
    height: 55,
    minHeight: 55
  })
}

const mapStateToProps = (state, ownProps) => {
  return {
    currentLayerId: getCurrentLayerId(state),
    selectOptions: getEffectSelectOptions(),
    showModal: ownProps.showModal
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onEffectAdded: (type, name, parentId) => {
      const attrs = registeredEffectModels[type].getInitialState()
      attrs.name = name
      attrs.parentId = parentId
      dispatch(addEffect(attrs))
    },
    toggleModal: () => {
      ownProps.toggleModal()
    }
  }
}

class NewEffect extends Component {
  constructor(props) {
    super(props)
    this.state = {
      newEffectType: initialEffectType,
      newEffectName: initialEffectName,
    }
  }

  render() {
    const {
      toggleModal, showModal, selectOptions, onEffectAdded
    } = this.props
    const selectedEffect = getEffectModel({type: this.state.newEffectType})
    const selectedOption = { value: selectedEffect.id, label: selectedEffect.type }

    return <Modal
      show={showModal}
      onHide={toggleModal}
    >
      <Modal.Header closeButton>
        <Modal.Title>Create new effect</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Row className="align-items-center">
          <Col sm={5}>
            Type
          </Col>
          <Col sm={7}>
            <Select
              value={selectedOption}
              onChange={this.onChangeNewType.bind(this)}
              styles={customStyles}
              maxMenuHeight={305}
              options={selectOptions} />
          </Col>
        </Row>
        <Row className="align-items-center mt-2">
          <Col sm={5}>
            Name
          </Col>
          <Col sm={7}>
            <Form.Control
              value={this.state.newEffectName}
              onFocus={this.handleNameFocus}
              onChange={this.onChangeNewName.bind(this)}
            />
          </Col>
        </Row>
      </Modal.Body>

      <Modal.Footer>
        <Button
          id="new-layer-close"
          variant="light"
          onClick={toggleModal}
        >
          Cancel
        </Button>
        <Button
          id="new-layer-add"
          variant="primary"
          onClick={() => {
            onEffectAdded(this.state.newEffectType, this.state.newEffectName, this.props.currentLayerId)
            toggleModal()
          }}
        >
          Create
        </Button>
      </Modal.Footer>
    </Modal>
  }

  handleNameFocus(event) {
    event.target.select()
  }

  onChangeNewType(selected) {
    const effect = getEffectModel({type: selected.value})
    this.setState(
      {
        newEffectType: selected.value,
        newEffectName: effect.type.toLowerCase()
      })
  }
  onChangeNewName(event) {
    this.setState(
      {
        newEffectName: event.target.value
      })
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(NewEffect)
