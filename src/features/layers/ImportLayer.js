import React, { Component } from 'react'
import { Button, Modal, Form, Accordion, Card } from 'react-bootstrap'
import { connect } from 'react-redux'

import ThetaRhoImporter from '../importer/ThetaRhoImporter'
import GCodeImporter from '../importer/GCodeImporter'
import { addLayer } from '../layers/layersSlice'
import { registeredShapes } from '../../models/shapes'
import ReactGA from 'react-ga'

const mapStateToProps = (state, ownProps) => {
  return {
    showModal: ownProps.showModal
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    toggleModal: () => {
      ownProps.toggleModal()
    },
    onLayerImport: (importProps) => {
      const attrs = {
        ...registeredShapes["file_import"].getInitialState(importProps),
        name: importProps.fileName
      }
      dispatch(addLayer(attrs))
    },
  }
}

class ImportLayer extends Component {
  render() {
    const {
      toggleModal, showModal
    } = this.props

    return <Modal
      size="lg"
      show={showModal}
      onHide={toggleModal}
    >
      <Modal.Header closeButton>
        <Modal.Title>Import new layer</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Accordion className="mb-4">
          <Card className="active mt-2">
            <Card.Header
              as={Form.Label}
              htmlFor="fileUpload"
              style={{ cursor: "pointer" }}
            >
              <h3>Import</h3>
              Imports a pattern file as a new layer. Supported formats are .thr, .gcode, and .nc.
              <Form.Control
                id="fileUpload"
                type="file"
                accept=".thr,.gcode,.nc"
                onChange={this.onFileSelected.bind(this)}
                style={{ display: "none" }}
              />
            </Card.Header>
          </Card>
        </Accordion>
        <div className="mt-2">
          <h3>Where to get .thr files</h3>
          Sisyphus machines use theta rho (.thr) files. There is a large community sharing them.
          <div className="row mt-2">
            <div className="col-6">
              <ul className="list-unstyled">
                <li><a href="https://reddit.com/u/markyland">Markyland on Reddit</a></li>
                <li><a href="https://github.com/Dithermaster/sisyphus/">Dithermaster &apos;s github</a></li>
                <li><a href="https://github.com/SlightlyLoony/JSisyphus">JSisyphus by Slightly Loony</a></li>
              </ul>
            </div>
            <div className="col-6">
              <ul className="list-unstyled">
                <li><a href="https://reddit.com/r/SisyphusIndustries">Sisyphus on Reddit</a></li>
                <li><a href="https://sisyphus-industries.com/community/community-tracks">Sisyphus Community</a></li>
                <li><a href="http://thejuggler.net/sisyphus/">The Juggler</a></li>
              </ul>
            </div>
          </div>

          <h3 className="mt-3">About copyrights</h3>
          <p>Be careful and respectful. Understand that the original author put their labor, intensity, and ideas into this art. The creators have a right to own it (and they have a copyright, even if it doesn&apos;t say so). If you don&apos;t have permisson (a license) to use their art, then you shouldn&apos;t be. If you do have permission to use their art, then you should be thankful, and I&apos;m sure they would appreciate you sending them a note of thanks. A picture of your table creating their shared art would probably make them smile.</p>
          <p>Someone posting the .thr file to a forum or subreddit probably wants it to be shared, and drawing it on your home table is probably OK. Just be careful if you want to use them for something significant without explicit permission.</p>
          <p>P.S. I am not a lawyer.</p>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button
          id="new-layer-close"
          variant="primary"
          onClick={toggleModal}
        >
          Done
        </Button>
      </Modal.Footer>
    </Modal>
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
      } else if (
        file.name.toLowerCase().endsWith('.gcode') ||
        file.name.toLowerCase().endsWith('.nc')
      ) {
        importer = new GCodeImporter(file.name, text)
      }

      importer.import(this.onFileImported.bind(this))
      this.props.toggleModal()
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
}

export default connect(mapStateToProps, mapDispatchToProps)(ImportLayer)
