import React, { useRef, useState, useEffect } from "react"
import Button from "react-bootstrap/Button"
import Modal from "react-bootstrap/Modal"
import Col from "react-bootstrap/Col"
import Row from "react-bootstrap/Row"
import Form from "react-bootstrap/Form"
import { useDispatch, useSelector } from "react-redux"
import { selectSelectedEffect } from "./effectsSlice"
import { addEffect } from "@/features/layers/layersSlice"

const CopyEffect = ({ toggleModal, showModal }) => {
  const dispatch = useDispatch()
  const selectedEffect = useSelector(selectSelectedEffect)
  const namedInputRef = useRef(null)
  const [copyEffectName, setCopyEffectName] = useState(
    selectedEffect?.name || "",
  )

  useEffect(() => {
    setCopyEffectName(selectedEffect?.name || "")
  }, [selectedEffect])

  const handleChangeCopyEffectName = (event) => {
    setCopyEffectName(event.target.value)
  }

  const handleNameFocus = (event) => {
    event.target.select()
  }

  const handleCopyEffect = (event) => {
    event.preventDefault()
    dispatch(
      addEffect({
        id: selectedEffect.layerId,
        effect: {
          ...selectedEffect,
          name: copyEffectName,
        },
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
        <Modal.Title>Copy {selectedEffect?.name || ""}</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleCopyEffect}>
        <Modal.Body>
          <Row className="align-items-center">
            <Col sm={5}>Name</Col>
            <Col sm={7}>
              <Form.Control
                ref={namedInputRef}
                value={copyEffectName}
                onFocus={handleNameFocus}
                onChange={handleChangeCopyEffectName}
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

export default CopyEffect
