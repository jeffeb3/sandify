import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button, ListGroup, Modal, Row, Col } from 'react-bootstrap'
import Select from 'react-select'
import { FaTrash } from 'react-icons/fa';
import { getLayerInfo, getCurrentLayer, getNumLayers } from '../layers/selectors'
import { setCurrentLayer, addLayer, updateLayers, removeLayer } from '../layers/layersSlice'
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
  }
}

const customStyles = {
  control: base => ({
    ...base,
    height: 55,
    minHeight: 55
  })
}

class Playlist extends Component {
  constructor(props) {
    super(props)
    this.state = {showNewLayer: false}
  }

  scrollToBottom() {
    this.layersList.scrollTop = this.layersList.scrollHeight
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
          <ListGroup variant="flush" ref={(el) => { this.layersList = el; }} style={{maxHeight: "160px"}} className="border overflow-auto mb-2">
            {this.props.layers.map((layer) => {
              const active = this.props.currentLayer.id === layer.id ? 'active' : ''
              return (
                <ListGroup.Item className={active + ' d-flex align-items-center'} key={layer.id} id={layer.id} onClick={this.props.onLayerSelected}>
                  <div className="no-select">{layer.name}</div>
                  {this.props.numLayers > 1 && <Button className="ml-auto layer-button" variant="link" data-id={layer.id} onClick={this.props.onLayerRemoved.bind(this)}>
                    <FaTrash />
                  </Button>}
                </ListGroup.Item>
              )
            })}
          </ListGroup>
          <Button variant="outline-primary" size="sm" onClick={this.toggleNewModal.bind(this)}>New</Button>
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Playlist)
