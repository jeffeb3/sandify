import React, { Component } from 'react'
import Select from 'react-select'
import { Button, Modal, Row, Col, Form } from 'react-bootstrap'
import { connect } from 'react-redux'

import { registeredEffectModels, getEffectSelectOptions, getEffectModel } from '../../config/effects'
import { addEffect, getCurrentLayerId } from './layersSlice'

// Initialize these from local storage, or reasonable defaults
const initialEffectType = localStorage.getItem('currentEffect') || 'loop'

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
    onEffectAdded: (type, parentId) => {
      const attrs = registeredEffectModels[type].getInitialState()
      attrs.name = registeredEffectModels[type].type
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
            onEffectAdded(this.state.newEffectType, this.props.currentLayerId)
            toggleModal()
          }}
        >
          Create
        </Button>
      </Modal.Footer>
    </Modal>
  }

  onChangeNewType(selected) {
    const effect = getEffectModel({type: selected.value})
    this.setState(
      {
        newEffectType: selected.value,
      })
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NewEffect)
