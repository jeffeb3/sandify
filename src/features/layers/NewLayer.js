import React, { useState } from "react"
import { useDispatch } from "react-redux"
import Select from "react-select"
import { Button, Modal, Row, Col, Form } from "react-bootstrap"
import {
  getShapeSelectOptions,
  getDefaultShape,
  getShapeFromType,
} from "@/features/shapes/factory"
import Layer from "./Layer"
import { addLayer } from "./layersSlice"

const defaultShape = getDefaultShape()
const customStyles = {
  control: (base) => ({
    ...base,
    height: 55,
    minHeight: 55,
  }),
}

const NewLayer = ({ toggleModal, showModal }) => {
  const dispatch = useDispatch()
  const selectOptions = getShapeSelectOptions()
  const [type, setType] = useState(defaultShape.type)
  const [name, setName] = useState(defaultShape.label)
  const selectedShape = getShapeFromType(type)
  const selectedOption = {
    value: selectedShape.id,
    label: selectedShape.label,
  }

  const handleNameFocus = (event) => {
    event.target.select()
  }

  const handleChangeNewType = (selected) => {
    const shape = getShapeFromType(selected.value)

    setType(selected.value)
    setName(shape.label.toLowerCase())
  }

  const handleChangeNewName = (event) => {
    setName(event.target.value)
  }

  const onLayerAdded = () => {
    const layer = new Layer(type)
    const attrs = layer.getInitialState()

    attrs.name = name
    dispatch(addLayer(attrs))
    toggleModal()
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
              onChange={handleChangeNewType}
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
              value={name}
              onFocus={handleNameFocus}
              onChange={handleChangeNewName}
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
          onClick={onLayerAdded}
        >
          Create
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default NewLayer
