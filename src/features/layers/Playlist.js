import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button, ListGroup, Modal, Row, Col } from 'react-bootstrap'
import Select from 'react-select'
import { SortableContainer, SortableElement } from 'react-sortable-hoc'
import { FaTrash } from 'react-icons/fa';
import { getLayerInfo, getCurrentLayer, getNumLayers } from '../layers/selectors'
import { setCurrentLayer, addLayer, updateLayers, removeLayer, moveLayer } from '../layers/layersSlice'
import { registeredShapes, getShapeSelectOptions, getShape } from '../../models/shapes'
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
    selectOptions: getShapeSelectOptions(),
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onLayerSelected: (event) => {
      dispatch(setCurrentLayer(event.target.closest('.list-group-item').id))
    },
    onLayerAdded: (type) => {
      const attrs = registeredShapes[type].getInitialState()
      dispatch(addLayer(attrs))
      dispatch(updateLayers({ showNewLayer: false }))
    },
    onLayerRemoved: (event) => {
      dispatch(removeLayer(event.target.closest('button').dataset.id))
    },
    onChangeNewType: (selected) => {
      dispatch(updateLayers({ newLayerType: selected.value }))
    },
    onLayerMoved: ({oldIndex, newIndex}) => {
      dispatch(moveLayer({oldIndex: oldIndex, newIndex: newIndex}))
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

const SortableItem = SortableElement(({id, name, active, canRemove, onLayerRemoved, onLayerSelected}) => {
  const activeClass = active ? 'active' : ''
  const dragClass = canRemove ? 'cursor-move' : ''
  return <ListGroup.Item className={[activeClass, dragClass, 'd-flex align-items-center'].join(' ')} key={id} id={id} onClick={onLayerSelected}>
    <div className="no-select">{name}</div>
    {canRemove && <Button className="ml-auto layer-button" variant="link" data-id={id} onClick={onLayerRemoved}>
      <FaTrash />
    </Button>}
  </ListGroup.Item>
})

const SortableList = SortableContainer(({layers, currentLayer, numLayers, onLayerSelected, onLayerRemoved}) => {
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
            canRemove={numLayers > 1}
            onLayerSelected={onLayerSelected}
            onLayerRemoved={onLayerRemoved}
            />
        )
      })}
    </ListGroup>
  )
})

class Playlist extends Component {
  constructor(props) {
    super(props)
    this.state = {showNewLayer: false}
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

  componentDidUpdate(prevProps) {
    if (this.props.numLayers > prevProps.numLayers) {
      // new layer added; make sure we scroll down to it
      this.scrollToBottom()
    }
  }

  render() {
    const selectedShape = getShape({type: this.props.newLayerType}) || this.props.shape
    const selectedOption = { value: selectedShape.id, label: selectedShape.name }

    return (
      <div>
        <Modal show={this.state.showNewLayer} onHide={this.toggleNewModal}>
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
            <Button id="new-layer-close" variant="link" onClick={this.toggleNewModal.bind(this)}>Close</Button>
            <Button id="new-layer-add" variant="primary" onClick={() => { this.props.onLayerAdded(this.props.newLayerType || this.props.currentLayer.type); this.toggleNewModal()}}>Create</Button>
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
            onLayerRemoved={this.props.onLayerRemoved.bind(this)}
            onSortEnd={this.props.onLayerMoved}
          />
          <Button className="mt-2" variant="outline-primary" size="sm" onClick={this.toggleNewModal.bind(this)}>New</Button>
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Playlist)
