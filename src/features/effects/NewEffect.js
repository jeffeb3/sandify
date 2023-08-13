import React, { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import Select from "react-select"
import { Button, Modal, Row, Col, Form } from "react-bootstrap"
import { selectSelectedLayer, addEffect } from "@/features/layers/layersSlice"
import {
  getEffectSelectOptions,
  getDefaultEffect,
  getEffectFromType,
} from "./factory"
import EffectLayer from "./EffectLayer"

const defaultEffect = getDefaultEffect()
const customStyles = {
  control: (base) => ({
    ...base,
    height: 55,
    minHeight: 55,
  }),
}

const NewEffect = ({ toggleModal, showModal }) => {
  const dispatch = useDispatch()
  const selectedLayer = useSelector(selectSelectedLayer)
  const selectOptions = getEffectSelectOptions()
  const [type, setType] = useState(defaultEffect.type)
  const [name, setName] = useState(defaultEffect.label)
  const selectedEffect = getEffectFromType(type)
  const selectedOption = {
    value: selectedEffect.id,
    label: selectedEffect.label,
  }

  const handleNameFocus = (event) => {
    event.target.select()
  }

  const handleChangeNewType = (selected) => {
    const effect = getEffectFromType(selected.value)

    setType(selected.value)
    setName(effect.label.toLowerCase())
  }

  const handleChangeNewName = (event) => {
    setName(event.target.value)
  }

  const onEffectAdded = () => {
    const layer = new EffectLayer(type)

    dispatch(
      addEffect({
        id: selectedLayer.id,
        effect: layer.getInitialState(),
      }),
    )
    toggleModal()
  }

  return (
    <Modal
      show={showModal}
      onHide={toggleModal}
    >
      <Modal.Header closeButton>
        <Modal.Title>Create new effect</Modal.Title>
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
          onClick={onEffectAdded}
        >
          Create
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default NewEffect
