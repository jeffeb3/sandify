import React from "react"
import Button from "react-bootstrap/Button"
import Modal from "react-bootstrap/Modal"
import Form from "react-bootstrap/Form"
import Accordion from "react-bootstrap/Accordion"
import Card from "react-bootstrap/Card"
import { useSelector, useDispatch } from "react-redux"
import ReactGA from "react-ga"
import { selectMachine } from "@/features/machine/machineSlice"
import ThetaRhoImporter from "@/features/importer/ThetaRhoImporter"
import GCodeImporter from "@/features/importer/GCodeImporter"
import { addLayer } from "./layersSlice"
import Layer from "./Layer"

const ImportLayer = ({ toggleModal, showModal }) => {
  const machineState = useSelector(selectMachine)
  const dispatch = useDispatch()
  let startTime

  const handleFileImported = (importer, importedProps) => {
    const layer = new Layer("fileImport")
    const layerProps = {
      ...importedProps,
      machine: machineState,
    }
    const attrs = layer.getInitialState(layerProps)
    const endTime = performance.now()

    dispatch(addLayer(attrs))
    ReactGA.timing({
      category: "PatternImport",
      variable: "read" + importer.label,
      value: endTime - startTime, // in milliseconds
    })
  }

  const handleFileSelected = (event) => {
    let file = event.target.files[0]
    let reader = new FileReader()

    reader.onload = (event) => {
      startTime = performance.now()
      var text = reader.result

      let importer
      if (file.name.toLowerCase().endsWith(".thr")) {
        importer = new ThetaRhoImporter(file.name, text)
      } else if (
        file.name.toLowerCase().endsWith(".gcode") ||
        file.name.toLowerCase().endsWith(".nc")
      ) {
        importer = new GCodeImporter(file.name, text)
      }

      importer.import(handleFileImported)
      toggleModal()
    }

    reader.readAsText(file)
  }

  return (
    <Modal
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
              Imports a pattern file as a new layer. Supported formats are .thr,
              .gcode, and .nc.
              <Form.Control
                id="fileUpload"
                type="file"
                accept=".thr,.gcode,.nc"
                onChange={handleFileSelected}
                style={{ display: "none" }}
              />
            </Card.Header>
          </Card>
        </Accordion>
        <div className="mt-2">
          <h3>Where to get .thr files</h3>
          Sisyphus machines use theta rho (.thr) files. There is a large
          community sharing them.
          <div className="row mt-2">
            <div className="col-6">
              <ul className="list-unstyled">
                <li>
                  <a href="https://reddit.com/u/markyland">
                    Markyland on Reddit
                  </a>
                </li>
                <li>
                  <a href="https://github.com/Dithermaster/sisyphus/">
                    Dithermaster&apos;s github
                  </a>
                </li>
                <li>
                  <a href="https://github.com/SlightlyLoony/JSisyphus">
                    JSisyphus by Slightly Loony
                  </a>
                </li>
              </ul>
            </div>
            <div className="col-6">
              <ul className="list-unstyled">
                <li>
                  <a href="https://reddit.com/r/SisyphusIndustries">
                    Sisyphus on Reddit
                  </a>
                </li>
                <li>
                  <a href="https://sisyphus-industries.com/community/community-tracks">
                    Sisyphus Community
                  </a>
                </li>
                <li>
                  <a href="http://thejuggler.net/sisyphus/">The Juggler</a>
                </li>
              </ul>
            </div>
          </div>
          <h3 className="mt-3">About copyrights</h3>
          <p>
            Be careful and respectful. Understand that the original author put
            their labor, intensity, and ideas into this art. The creators have a
            right to own it (and they have a copyright, even if it doesn&apos;t
            say so). If you don&apos;t have permission (a license) to use their
            art, then you shouldn&apos;t be. If you do have permission to use
            their art, then you should be thankful, and I&apos;m sure they would
            appreciate you sending them a note of thanks. A picture of your
            table creating their shared art would probably make them smile.
          </p>
          <p>
            Someone posting the .thr file to a forum or subreddit probably wants
            it to be shared, and drawing it on your home table is probably OK.
            Just be careful if you want to use them for something significant
            without explicit permission.
          </p>
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
  )
}

export default ImportLayer
