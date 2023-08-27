import React, { useState, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import Select from "react-select"
import Col from "react-bootstrap/Col"
import Row from "react-bootstrap/Row"
import Form from "react-bootstrap/Form"
import Button from "react-bootstrap/Button"
import Modal from "react-bootstrap/Modal"
import {
  selectSelectedLayer,
  addEffect,
  selectLayerVertices,
} from "@/features/layers/layersSlice"
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
  const selectRef = useRef()
  const selectedLayer = useSelector(selectSelectedLayer)
  const selectedLayerVertices = useSelector((state) =>
    selectLayerVertices(state, selectedLayer.id),
  )
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

  const handleInitialFocus = () => {
    selectRef.current.focus()
  }

  const handleChangeNewType = (selected) => {
    const effect = getEffectFromType(selected.value)

    setType(selected.value)
    setName(effect.label.toLowerCase())
  }

  const handleChangeNewName = (event) => {
    setName(event.target.value)
  }

  const onEffectAdded = (event) => {
    const layer = new EffectLayer(type)

    event.preventDefault()
    dispatch(
      addEffect({
        id: selectedLayer.id,
        effect: layer.getInitialState(selectedLayer, selectedLayerVertices),
      }),
    )
    toggleModal()
  }

  return (
    <Modal
      show={showModal}
      onHide={toggleModal}
      onEntered={handleInitialFocus}
    >
      <Modal.Header closeButton>
        <Modal.Title>Create new effect</Modal.Title>
      </Modal.Header>

      <Form onSubmit={onEffectAdded}>
        <Modal.Body>
          <Row className="align-items-center">
            <Col sm={5}>Type</Col>
            <Col sm={7}>
              <Select
                ref={selectRef}
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
            type="submit"
          >
            Create
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default NewEffect
