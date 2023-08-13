import React, { useRef, useState } from "react"
import { Button, Modal, Row, Col, Form } from "react-bootstrap"
import { useDispatch, useSelector } from "react-redux"
import { copyLayer } from "./layersSlice"
import { selectSelectedLayer } from "./layersSlice"

const CopyLayer = ({ toggleModal, showModal }) => {
  const dispatch = useDispatch()
  const selectedLayer = useSelector(selectSelectedLayer)
  const namedInputRef = useRef(null)
  const [copyLayerName, setCopyLayerName] = useState(selectedLayer.name)

  const handleChangeCopyLayerName = (event) => {
    setCopyLayerName(event.target.value)
  }

  const handleNameFocus = (event) => {
    event.target.select()
  }

  const handleCopyLayer = () => {
    dispatch(
      copyLayer({
        id: selectedLayer.id,
        name: copyLayerName,
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
        <Modal.Title>Copy {selectedLayer.name}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Row className="align-items-center">
          <Col sm={5}>Name</Col>
          <Col sm={7}>
            <Form.Control
              ref={namedInputRef}
              value={copyLayerName}
              onFocus={handleNameFocus}
              onChange={handleChangeCopyLayerName}
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
          onClick={handleCopyLayer}
        >
          Copy
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default CopyLayer
