import React, { useRef, useState, useEffect } from "react"
import Button from "react-bootstrap/Button"
import Modal from "react-bootstrap/Modal"
import Col from "react-bootstrap/Col"
import Row from "react-bootstrap/Row"
import Form from "react-bootstrap/Form"
import { useDispatch, useSelector } from "react-redux"
import { selectCurrentMachine, addMachine } from "./machinesSlice"

const CopyMachine = ({ toggleModal, showModal }) => {
  const dispatch = useDispatch()
  const currentMachine = useSelector(selectCurrentMachine)
  const namedInputRef = useRef(null)
  const [copyMachineName, setCopyMachineName] = useState(
    currentMachine?.name || "",
  )

  useEffect(() => {
    setCopyMachineName(currentMachine?.name || "")
  }, [currentMachine])

  const handleChangeCopyMachineName = (event) => {
    setCopyMachineName(event.target.value)
  }

  const handleNameFocus = (event) => {
    event.target.select()
  }

  const handleCopyMachine = (event) => {
    event.preventDefault()
    dispatch(
      addMachine({
        ...currentMachine,
        name: copyMachineName,
      }),
    )
    toggleModal()
  }

  const handleInitialFocus = () => {
    namedInputRef.current.focus()
  }

  return (
    <Modal
      show={showModal}
      onHide={toggleModal}
      onEntered={handleInitialFocus}
    >
      <Modal.Header closeButton>
        <Modal.Title>Copy {currentMachine?.name || ""}</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleCopyMachine}>
        <Modal.Body>
          <Row className="align-items-center">
            <Col sm={5}>Name</Col>
            <Col sm={7}>
              <Form.Control
                ref={namedInputRef}
                value={copyMachineName}
                onFocus={handleNameFocus}
                onChange={handleChangeCopyMachineName}
              />
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button
            id="copy-layer-close"
            variant="light"
            onClick={toggleModal}
          >
            Cancel
          </Button>
          <Button
            id="copy-layer-copy"
            variant="primary"
            type="submit"
          >
            Copy
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default CopyMachine
