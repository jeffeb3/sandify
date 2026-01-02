import React, { useState } from "react"
import { useTranslation, Trans } from "react-i18next"
import { useSelector, useDispatch } from "react-redux"
import Col from "react-bootstrap/Col"
import Row from "react-bootstrap/Row"
import Button from "react-bootstrap/Button"
import Modal from "react-bootstrap/Modal"
import { downloadFile } from "@/common/util"
import DropdownOption from "@/components/DropdownOption"
import InputOption from "@/components/InputOption"
import CheckboxOption from "@/components/CheckboxOption"
import { selectLayersForExport } from "@/features/layers/layersSlice"
import {
  selectExporterState,
  updateExporter,
} from "@/features/export/exporterSlice"
import { selectCurrentMachine } from "@/features/machines/machinesSlice"
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
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const machine = useSelector(selectCurrentMachine)
  const exporterState = useSelector(selectExporterState)
  const {
    fileType,
    fileName,
    pre,
    post,
    polarRhoMax,
    unitsPerCircle,
    reverse,
  } = exporterState
  const [fields, setFields] = useState({
    fileType,
    fileName,
    pre,
    post,
    polarRhoMax,
    unitsPerCircle,
    reverse,
  })
  const [savedFields] = useState({
    fileType,
    fileName,
    pre,
    post,
    polarRhoMax,
    unitsPerCircle,
    reverse,
  })

  const props = {
    ...fields,
    offsetX:
      machine.type === "rectangular"
        ? (machine.minX + machine.maxX) / 2.0
        : machine.maxRadius,
    offsetY:
      machine.type === "rectangular"
        ? (machine.minY + machine.maxY) / 2.0
        : machine.maxRadius,
    width:
      machine.type === "rectangular"
        ? machine.maxX - machine.minX
        : 2.0 * machine.maxRadius,
    height:
      machine.type === "rectangular"
        ? machine.maxY - machine.minY
        : 2.0 * machine.maxRadius,
    maxRadius:
      machine.type === "rectangular"
        ? Math.sqrt(
            Math.pow((machine.maxX - machine.minX) / 2, 2.0) +
              Math.pow((machine.maxY - machine.minY) / 2, 2.0),
          )
        : machine.maxRadius,
    layers: useSelector(selectLayersForExport),
  }
  const exporter = new exporters[fields.fileType](props)

  const handleChange = (value) => {
    setFields((prevFields) => ({
      ...prevFields,
      ...value,
    }))
  }

  const handleDownload = () => {
    let name = fields.fileName
    if (!name.includes(".")) {
      name += exporter.fileExtension
    }
    const type =
      fields.fileType === SVG
        ? "image/svg+xml;charset=utf-8"
        : "text/plain;charset=utf-8"

    exporter.export()
    downloadFile(name, exporter.lines.join("\n"), type)
    dispatch(updateExporter(fields))
    toggleModal()
  }

  const handleCancel = () => {
    setFields(savedFields)
    toggleModal()
  }

  return (
    <Modal
      size="lg"
      show={showModal}
      onHide={toggleModal}
    >
      <Modal.Header closeButton>
        <Modal.Title>{t("Export to a file")}</Modal.Title>
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
            <Trans
              i18nKey="export.wikiNote"
              defaults="See the <0>wiki</0> for details on program export variables."
              components={[
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://github.com/jeffeb3/sandify/wiki#export-variables"
                >
                  wiki
                </a>,
              ]}
            />
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
          onClick={handleCancel}
        >
          {t("Cancel")}
        </Button>
        <Button
          id="code-download"
          variant="primary"
          onClick={handleDownload}
        >
          {t("Download")}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default React.memo(ExportDownloader)
