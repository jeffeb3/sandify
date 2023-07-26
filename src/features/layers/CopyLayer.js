import React, { Component } from "react"
import { Button, Modal, Row, Col, Form } from "react-bootstrap"
import { connect } from "react-redux"

import { getLayersState } from "../store/selectors"
import { copyLayer, updateLayers } from "../layers/layersSlice"
import { getCurrentLayer } from "../layers/selectors"

const mapStateToProps = (state, ownProps) => {
  const layers = getLayersState(state)
  const current = getCurrentLayer(state)

  return {
    copyLayerName: layers.copyLayerName || current.name,
    showModal: ownProps.showModal,
    currentLayer: current,
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    toggleModal: () => {
      ownProps.toggleModal()
    },
    onChangeCopyName: (event) => {
      dispatch(updateLayers({ copyLayerName: event.target.value }))
    },
    onLayerCopied: (id) => {
      dispatch(copyLayer(id))
    },
  }
}

class CopyLayer extends Component {
  render() {
    const namedInputRef = React.createRef()
    const {
      currentLayer,
      copyLayerName,
      onChangeCopyName,
      onLayerCopied,
      toggleModal,
      showModal,
    } = this.props

    return (
      <Modal
        show={showModal}
        onHide={toggleModal}
        onEntered={() => namedInputRef.current.focus()}
      >
        <Modal.Header closeButton>
          <Modal.Title>Copy {currentLayer.name}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Row className="align-items-center">
            <Col sm={5}>Name</Col>
            <Col sm={7}>
              <Form.Control
                ref={namedInputRef}
                value={copyLayerName}
                onFocus={this.handleNameFocus}
                onChange={onChangeCopyName}
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
            onClick={() => {
              onLayerCopied(currentLayer.id)
              toggleModal()
            }}
          >
            Copy
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  handleNameFocus(event) {
    event.target.select()
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CopyLayer)
