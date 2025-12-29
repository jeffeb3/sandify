import React, { useRef, useState, useEffect } from "react"
import Col from "react-bootstrap/Col"
import Row from "react-bootstrap/Row"
import Form from "react-bootstrap/Form"
import Button from "react-bootstrap/Button"
import Modal from "react-bootstrap/Modal"
import { useDispatch, useSelector } from "react-redux"
import { useTranslation } from "react-i18next"
import { copyLayer } from "./layersSlice"
import { selectSelectedLayer } from "./layersSlice"

const CopyLayer = ({ toggleModal, showModal }) => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const selectedLayer = useSelector(selectSelectedLayer)
  const namedInputRef = useRef(null)
  const [copyLayerName, setCopyLayerName] = useState(selectedLayer.name)

  useEffect(() => {
    setCopyLayerName(selectedLayer.name)
  }, [selectedLayer])

  const handleChangeCopyLayerName = (event) => {
    setCopyLayerName(event.target.value)
  }

  const handleNameFocus = (event) => {
    event.target.select()
  }

  const handleCopyLayer = (event) => {
    event.preventDefault()
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
        <Modal.Title>{t('copyLayer.title', { name: selectedLayer.name })}</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleCopyLayer}>
        <Modal.Body>
          <Row className="align-items-center">
            <Col sm={5}>{t('copyLayer.name')}</Col>
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
            {t('common.cancel')}
          </Button>
          <Button
            id="copy-layer-copy"
            variant="primary"
            type="submit"
          >
            {t('common.copy')}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default CopyLayer
