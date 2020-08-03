import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Accordion, Button, Card, ListGroup, Modal, Row, Col, Form } from 'react-bootstrap'
import Select from 'react-select'
import { SortableContainer, SortableElement } from 'react-sortable-hoc'
import { FaTrash, FaEye, FaEyeSlash, FaCopy, FaUpload } from 'react-icons/fa';
import { getLayerInfo, getCurrentLayer, getNumLayers } from '../layers/selectors'
import { setCurrentLayer, addLayer, copyLayer, updateLayers, removeLayer, moveLayer, toggleVisible } from '../layers/layersSlice'
import { registeredShapes, getShapeSelectOptions, getShape, getAnyShape } from '../../models/shapes'
import ReactGA from 'react-ga'
import ThetaRhoImporter from '../importer/ThetaRhoImporter'
import GCodeImporter from '../importer/GCodeImporter'
import './Playlist.scss'

const mapStateToProps = (state, ownProps) => {
  const layer = getCurrentLayer(state)
  const shape = getShape(layer)

  return {
    layers: getLayerInfo(state),
    numLayers: getNumLayers(state),
    currentLayer: layer,
    shape: shape,
    newLayerType: state.layers.newLayerType,
    copyLayerName: state.layers.copyLayerName,
    selectOptions: getShapeSelectOptions(),
    defaultNewShape: getAnyShape(),
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onLayerSelected: (event) => {
      const id = event.target.closest('.list-group-item').id
      dispatch(setCurrentLayer(id))
    },
    onLayerAdded: (type) => {
      const attrs = registeredShapes[type].getInitialState()
      dispatch(addLayer(attrs))
    },
    onLayerImport: (importProps) => {
      const attrs = {
          ...registeredShapes["file_import"].getInitialState(importProps),
          name: importProps.fileName
      }

      dispatch(addLayer(attrs))
    },
    onLayerCopied: (id) => {
      dispatch(copyLayer(id))
    },
    onLayerRemoved: (event) => {
      dispatch(removeLayer(event.target.closest('button').dataset.id))
    },
    onChangeNewType: (selected) => {
      dispatch(updateLayers({ newLayerType: selected.value }))
    },
    onChangeCopyName: (event) => {
      dispatch(updateLayers({ copyLayerName: event.target.value }))
    },
    onLayerMoved: ({oldIndex, newIndex}) => {
      dispatch(moveLayer({oldIndex: oldIndex, newIndex: newIndex}))
    },
    onToggleLayerVisible: (event) => {
      const id = event.target.closest('.list-group-item').id
      dispatch(toggleVisible({id: id}))
    }
  }
}

const customStyles = {
  control: base => ({
    ...base,
    height: 55,
    minHeight: 55
  })
}

const SortableItem = SortableElement(({id, name, active, canRemove, visible, onCopyLayer, onLayerRemoved, onLayerSelected, onToggleLayerVisible}) => {
  const activeClass = active ? 'active' : ''
  const dragClass = canRemove ? 'cursor-move' : ''
  return <ListGroup.Item className={[activeClass, dragClass, 'd-flex align-items-center'].join(' ')} key={id} id={id} onClick={onLayerSelected}>
    <Button className="layer-button" variant="link" data-id={id} onClick={onToggleLayerVisible}>
      {visible && <FaEye />}
      {!visible && <FaEyeSlash />}
    </Button>
    <div className="no-select">{name}</div>
    <Button className="ml-auto layer-button" variant="link" data-id={id} onClick={onCopyLayer}>
      <FaCopy />
    </Button>
    {canRemove && <Button className="layer-button" variant="link" data-id={id} onClick={onLayerRemoved}>
      <FaTrash />
    </Button>}
  </ListGroup.Item>
})

const SortableList = SortableContainer(({layers, currentLayer, numLayers, onCopyLayer, onLayerSelected, onLayerRemoved, onToggleLayerVisible}) => {
  return (
    <ListGroup variant="flush" style={{maxHeight: "200px"}} className="border overflow-auto" id="playlist-group">
      {layers.map((layer, index) => {
        return (
          <SortableItem
            key={layer.id}
            id={layer.id}
            name={layer.name}
            index={index}
            active={currentLayer.id === layer.id}
            visible={layer.visible}
            canRemove={numLayers > 1}
            onCopyLayer={onCopyLayer}
            onLayerSelected={onLayerSelected}
            onLayerRemoved={onLayerRemoved}
            onToggleLayerVisible={onToggleLayerVisible}
            />
        )
      })}
    </ListGroup>
  )
})

class Playlist extends Component {
  constructor(props) {
    super(props)
    this.state = {
        showNewLayer: false,
        showImportLayer: false,
        showCopyLayer: false
    }
  }

  scrollToBottom() {
    // we're not supposed to directly access DOM with React, with instead use a ref. That said, I can't figure
    // out how to get the nested ref in an elegant way.
    const el = document.getElementById('playlist-group')
    el.scrollTop = el.scrollHeight
  }

  toggleNewModal() {
    this.setState({showNewLayer: !this.state.showNewLayer})
  }

  toggleImportModal() {
    this.setState({showImportLayer: !this.state.showImportLayer})
  }

  onFileSelected(event) {
    let file = event.target.files[0]
    let reader = new FileReader()

    reader.onload = (event) => {
      this.startTime = performance.now()
      var text = reader.result

      let importer
      if (file.name.toLowerCase().endsWith('.thr')) {
        importer = new ThetaRhoImporter(file.name, text)
      } else if (file.name.toLowerCase().endsWith('.gcode') || file.name.toLowerCase().endsWith('.nc')) {
        importer = new GCodeImporter(file.name, text)
      }

      importer.import(this.onFileImported.bind(this))
      this.toggleImportModal.bind(this)();
    }

    reader.readAsText(file)
  }

  onFileImported(importer, importerProps) {
    this.props.onLayerImport(importerProps)

    this.endTime = performance.now()
    ReactGA.timing({
      category: 'PatternImport',
      variable: 'read' + importer.label,
      value: this.endTime - this.startTime // in milliseconds
    })
  }

  toggleCopyModal() {
    this.setState({showCopyLayer: !this.state.showCopyLayer})
  }

  handleNameFocus(event) {
    event.target.select()
  }

  componentDidUpdate(prevProps) {
    if (this.props.numLayers > prevProps.numLayers) {
      // new layer added; make sure we scroll down to it
      this.scrollToBottom()
    }
  }

  render() {

    const selectedShape = getShape({type: this.props.newLayerType}) || this.props.defaultNewShape
    const selectedOption = { value: selectedShape.id, label: selectedShape.name }
    const namedInputRef = React.createRef()

    return (
      <div>
        <Modal show={this.state.showNewLayer} onHide={this.toggleNewModal.bind(this)}>
          <Modal.Header closeButton>
            <Modal.Title>Create new layer</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Row className="align-items-center">
              <Col sm={5}>
                Shape
              </Col>
              <Col sm={7}>
                <Select
                  value={selectedOption}
                  onChange={this.props.onChangeNewType}
                  styles={customStyles}
                  maxMenuHeight={305}
                  options={this.props.selectOptions} />
              </Col>
            </Row>
          </Modal.Body>

          <Modal.Footer>
            <Button id="new-layer-close" variant="link" onClick={this.toggleNewModal.bind(this)}>Cancel</Button>
            <Button id="new-layer-add" variant="primary" onClick={() => { this.props.onLayerAdded(this.props.newLayerType || this.props.currentLayer.type); this.toggleNewModal()}}>Create</Button>
          </Modal.Footer>
        </Modal>

        <Modal show={this.state.showImportLayer} onHide={this.toggleImportModal.bind(this)}>
          <Modal.Header closeButton>
            <Modal.Title>Import new layer</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Accordion className="mb-4">
              <Card>
                <Card.Header as={Form.Label} htmlFor="fileUpload" style={{ cursor: "pointer" }}>
                  <h3>Import</h3>
                  Imports a pattern from a .thr, .gcode, or .nc file.
                  <Form.Control
                      id="fileUpload"
                      type="file"
                      accept=".thr,.gcode,.nc"
                      onChange={this.onFileSelected.bind(this)}
                      style={{ display: "none" }} />
                </Card.Header>
              </Card>
            </Accordion>
          </Modal.Body>

          <Modal.Footer>
            <Button id="new-layer-close" variant="link" onClick={this.toggleImportModal.bind(this)}>Cancel</Button>
          </Modal.Footer>
        </Modal>

        <Modal show={this.state.showCopyLayer}
          onHide={this.toggleCopyModal.bind(this)}
          onEntered={() => namedInputRef.current.focus()}
        >
          <Modal.Header closeButton>
            <Modal.Title>Copy {this.props.currentLayer.name}</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Row className="align-items-center">
              <Col sm={5}>
                Name
              </Col>
              <Col sm={7}>
                <Form.Control
                  ref={namedInputRef}
                  value={this.props.copyLayerName}
                  onFocus={this.handleNameFocus}
                  onChange={this.props.onChangeCopyName}
                />
              </Col>
            </Row>
          </Modal.Body>

          <Modal.Footer>
            <Button id="copy-layer-close" variant="link" onClick={this.toggleCopyModal.bind(this)}>Cancel</Button>
            <Button id="copy-layer-copy" variant="primary" onClick={() => { this.props.onLayerCopied(this.props.currentLayer.id); this.toggleCopyModal(); }}>Copy</Button>
          </Modal.Footer>
        </Modal>

        <div className="p-3">
          <h2 className="panel">Layers ({this.props.numLayers})</h2>
          <SortableList
            pressDelay={150}
            layers={this.props.layers}
            currentLayer={this.props.currentLayer}
            numLayers={this.props.numLayers}
            onLayerSelected={this.props.onLayerSelected}
            onCopyLayer={this.toggleCopyModal.bind(this)}
            onLayerRemoved={this.props.onLayerRemoved.bind(this)}
            onSortEnd={this.props.onLayerMoved}
            onToggleLayerVisible={this.props.onToggleLayerVisible}
          />
          <Button className="mt-2 newLayerButton" variant="outline-primary" size="sm" onClick={this.toggleNewModal.bind(this)}>New</Button>
          <Button className="mt-2 newLayerButton" variant="outline-primary" size="sm" onClick={this.toggleImportModal.bind(this)}><FaUpload/></Button>
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Playlist)
