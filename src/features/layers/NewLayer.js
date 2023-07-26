import React, { Component } from "react"
import Select from "react-select"
import { Button, Modal, Row, Col, Form } from "react-bootstrap"
import { connect } from "react-redux"
import {
  getModelSelectOptions,
  getDefaultModel,
  getModelFromType,
} from "@/config/models"
import Layer from "./Layer"
import { addLayer } from "./layersSlice"

const defaultModel = getDefaultModel()
const customStyles = {
  control: (base) => ({
    ...base,
    height: 55,
    minHeight: 55,
  }),
}

const mapStateToProps = (state, ownProps) => {
  return {
    selectOptions: getModelSelectOptions(),
    showModal: ownProps.showModal,
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onLayerAdded: (type, name) => {
      const layer = new Layer(type)
      const attrs = layer.getInitialState()

      attrs.name = name
      dispatch(addLayer(attrs))
    },
    toggleModal: () => {
      ownProps.toggleModal()
    },
  }
}

class NewLayer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      type: defaultModel.type,
      name: defaultModel.label,
    }
  }

  render() {
    const { toggleModal, showModal, selectOptions, onLayerAdded } = this.props
    const selectedShape = getModelFromType(this.state.type)
    const selectedOption = {
      value: selectedShape.id,
      label: selectedShape.label,
    }

    return (
      <Modal
        show={showModal}
        onHide={toggleModal}
      >
        <Modal.Header closeButton>
          <Modal.Title>Create new layer</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Row className="align-items-center">
            <Col sm={5}>Type</Col>
            <Col sm={7}>
              <Select
                value={selectedOption}
                onChange={this.onChangeNewType.bind(this)}
                styles={customStyles}
                maxMenuHeight={305}
                options={selectOptions}
              />
            </Col>
          </Row>
          <Row className="align-items-center mt-2">
            <Col sm={5}>Name</Col>
            <Col sm={7}>
              <Form.Control
                value={this.state.name}
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
              onLayerAdded(this.state.type, this.state.name)
              toggleModal()
            }}
          >
            Create
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  handleNameFocus(event) {
    event.target.select()
  }

  onChangeNewType(selected) {
    const model = getModelFromType(selected.value)

    this.setState({
      type: selected.value,
      name: model.label.toLowerCase(),
    })
  }
  onChangeNewName(event) {
    this.setState({
      name: event.target.value,
    })
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NewLayer)
