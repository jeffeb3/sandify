import React from "react"
import { useSelector, useDispatch } from "react-redux"
import Col from "react-bootstrap/Col"
import Row from "react-bootstrap/Row"
import Button from "react-bootstrap/Button"
import Modal from "react-bootstrap/Modal"
import { downloadFile } from "@/common/util"
import DropdownOption from "@/components/DropdownOption"
import InputOption from "@/components/InputOption"
import CheckboxOption from "@/components/CheckboxOption"
import { selectConnectedVertices } from "@/features/layers/layersSlice"
import {
  selectExporterState,
  selectComments,
  updateExporter,
} from "@/features/export/exporterSlice"
import { selectMachine } from "@/features/machines/machineSlice"
import GCodeExporter from "./GCodeExporter"
import ScaraGCodeExporter from "./ScaraGCodeExporter"
import SvgExporter from "./SvgExporter"
import ThetaRhoExporter from "./ThetaRhoExporter"
import { exporterOptions, GCODE, THETARHO, SVG, SCARA } from "./Exporter"

const exporters = {
  [GCODE]: GCodeExporter,
  [THETARHO]: ThetaRhoExporter,
  [SVG]: SvgExporter,
  [SCARA]: ScaraGCodeExporter,
}

const ExportDownloader = ({ showModal, toggleModal }) => {
  const dispatch = useDispatch()
  const machine = useSelector(selectMachine)
  const exporterState = useSelector(selectExporterState)
  const { fileType, fileName } = exporterState
  const props = {
    ...exporterState,
    offsetX: machine.rectangular
      ? (machine.minX + machine.maxX) / 2.0
      : machine.maxRadius,
    offsetY: machine.rectangular
      ? (machine.minY + machine.maxY) / 2.0
      : machine.maxRadius,
    width: machine.rectangular
      ? machine.maxX - machine.minX
      : 2.0 * machine.maxRadius,
    height: machine.rectangular
      ? machine.maxY - machine.minY
      : 2.0 * machine.maxRadius,
    maxRadius: machine.rectangular
      ? Math.sqrt(
          Math.pow(machine.maxX - machine.minX, 2.0) +
            Math.pow(machine.maxY - machine.minY, 2.0),
        )
      : machine.maxRadius,
    vertices: useSelector(selectConnectedVertices),
    comments: useSelector(selectComments),
  }
  const exporter = new exporters[fileType](props)

  const handleChange = (attrs) => {
    dispatch(updateExporter(attrs))
  }

  const handleDownload = () => {
    let name = fileName
    if (!fileName.includes(".")) {
      name += exporter.fileExtension
    }
    const type =
      fileType === SVG
        ? "image/svg+xml;charset=utf-8"
        : "text/plain;charset=utf-8"

    exporter.export()
    downloadFile(name, exporter.lines.join("\n"), type)
    toggleModal()
  }

  return (
    <Modal
      size="lg"
      show={showModal}
      onHide={toggleModal}
    >
      <Modal.Header closeButton>
        <Modal.Title>Export to a file</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <DropdownOption
          onChange={handleChange}
          options={exporterOptions}
          optionKey="fileType"
          key="fileType"
          index={0}
          data={props}
        />

        {fileType === SCARA && (
          <Row>
            <Col sm={5}></Col>
            <Col
              sm={7}
              className="mb-2"
            >
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://github.com/jeffeb3/sandify/wiki/Scara-GCode"
              >
                Read more
              </a>{" "}
              about SCARA GCode.
            </Col>
          </Row>
        )}

        <InputOption
          onChange={handleChange}
          options={exporterOptions}
          key="fileName"
          optionKey="fileName"
          index={1}
          data={props}
        />

        {(fileType === THETARHO || fileType === SCARA) && (
          <InputOption
            onChange={handleChange}
            options={exporterOptions}
            key="polarRhoMax"
            optionKey="polarRhoMax"
            index={2}
            data={props}
          />
        )}

        {fileType === SCARA && (
          <InputOption
            onChange={handleChange}
            options={exporterOptions}
            key="unitsPerCircle"
            optionKey="unitsPerCircle"
            index={2}
            data={props}
          />
        )}

        <InputOption
          onChange={handleChange}
          options={exporterOptions}
          key="pre"
          optionKey="pre"
          index={3}
          data={props}
        />

        <InputOption
          onChange={handleChange}
          options={exporterOptions}
          key="post"
          optionKey="post"
          index={4}
          data={props}
        />

        <Row>
          <Col sm={5}></Col>
          <Col sm={7}>
            See{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/jeffeb3/sandify/wiki#export-variables"
            >
              {" "}
              the wiki{" "}
            </a>{" "}
            for details on available program export variables.
          </Col>
        </Row>

        <div className="mt-2">
          <CheckboxOption
            onChange={handleChange}
            options={exporterOptions}
            optionKey="reverse"
            key="reverse"
            index={5}
            data={props}
          />
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button
          id="code-close"
          variant="light"
          onClick={toggleModal}
        >
          Close
        </Button>
        <Button
          id="code-download"
          variant="primary"
          onClick={handleDownload}
        >
          Download
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default React.memo(ExportDownloader)
