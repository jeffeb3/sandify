import React, { useState, useRef } from "react"
import { useDispatch } from "react-redux"
import Select from "react-select"
import Col from "react-bootstrap/Col"
import Row from "react-bootstrap/Row"
import Form from "react-bootstrap/Form"
import Button from "react-bootstrap/Button"
import Modal from "react-bootstrap/Modal"
import {
  getDefaultMachine,
  getMachineSelectOptions,
  getMachine,
} from "./machineFactory"
import { addMachine } from "./machinesSlice"

const defaultMachine = getDefaultMachine()
const customStyles = {
  control: (base) => ({
    ...base,
    height: 55,
    minHeight: 55,
  }),
}

const NewMachine = ({ toggleModal, showModal }) => {
  const dispatch = useDispatch()
  const selectRef = useRef()
  const selectOptions = getMachineSelectOptions()
  const [type, setType] = useState(defaultMachine.type)
  const [name, setName] = useState(defaultMachine.label)

  const selectedMachine = getMachine({ type })
  const selectedOption = {
    value: selectedMachine.id,
    label: selectedMachine.label,
  }

  const handleNameFocus = (event) => {
    event.target.select()
  }

  const handleInitialFocus = () => {
    selectRef.current.focus()
  }

  const handleChangeNewType = (selected) => {
    const machine = getMachine(selected.value)

    setType(selected.value)
    setName(machine.label.toLowerCase())
  }

  const handleChangeNewName = (event) => {
    setName(event.target.value)
  }

  const onMachineAdded = (event) => {
    const machine = getMachine(type)

    event.preventDefault()
    dispatch(
      addMachine({
        ...machine.getInitialState(),
        name,
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
        <Modal.Title>Create new machine</Modal.Title>
      </Modal.Header>

      <Form onSubmit={onMachineAdded}>
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

export default NewMachine
