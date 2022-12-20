import React, { Component } from 'react'
import Select from 'react-select'
import { Button, Modal, Row, Col, Form } from 'react-bootstrap'
import { connect } from 'react-redux'

import { getLayers } from '../store/selectors'
import { getCurrentLayer } from '../layers/selectors'
import { registeredModels, getModelSelectOptions, getModel } from '../../config/models'
import { addLayer, updateLayers, setNewLayerType } from '../layers/layersSlice'

const customStyles = {
  control: base => ({
    ...base,
    height: 55,
    minHeight: 55
  })
}

const mapStateToProps = (state, ownProps) => {
  const layers = getLayers(state)
  const layer = getCurrentLayer(state)

  return {
    newLayerType: layers.newLayerType,
    newLayerName: layers.newLayerName,
    currentLayer: layer,
    selectOptions: getModelSelectOptions(false),
    showModal: ownProps.showModal
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onChangeNewType: (selected) => {
      dispatch(setNewLayerType(selected.value))
    },
    onChangeNewName: (event) => {
      dispatch(updateLayers({ newLayerName: event.target.value, newLayerNameOverride: true }))
    },
    onLayerAdded: (type) => {
      const attrs = registeredModels[type].getInitialState()
      dispatch(addLayer(attrs))
    },
    toggleModal: () => {
      ownProps.toggleModal()
    }
  }
}

class NewLayer extends Component {
  render() {
    const {
      newLayerType, currentLayer, toggleModal, showModal, selectOptions, newLayerName,
      onChangeNewType, onChangeNewName, onLayerAdded
    } = this.props
    const selectedShape = getModel({type: newLayerType})
    const selectedOption = { value: selectedShape.id, label: selectedShape.name }

    return <Modal
      show={showModal}
      onHide={toggleModal}
    >
      <Modal.Header closeButton>
        <Modal.Title>Create new layer</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Row className="align-items-center">
          <Col sm={5}>
            Type
          </Col>
          <Col sm={7}>
            <Select
              value={selectedOption}
              onChange={onChangeNewType}
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
              value={newLayerName}
              onFocus={this.handleNameFocus}
              onChange={onChangeNewName}
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
            onLayerAdded(newLayerType || currentLayer.type)
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
}

export default connect(mapStateToProps, mapDispatchToProps)(NewLayer)
