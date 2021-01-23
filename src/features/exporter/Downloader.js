import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button, Modal, Col, Row } from 'react-bootstrap'
import DropdownOption from '../../components/DropdownOption'
import InputOption from '../../components/InputOption'
import CheckboxOption from '../../components/CheckboxOption'
import { updateExporter } from './exporterSlice'
import { getComments } from './selectors'
import { getAllComputedVertices } from '../machine/selectors'
import ReactGA from 'react-ga'
import ThetaRhoExporter from './ThetaRhoExporter'
import GCodeExporter from './GCodeExporter'
import SvgExporter from './SvgExporter'
import {
  gcodeTypeName,
  thrTypeName,
  svgTypeName,
  Exporter,
} from '../../models/Exporter'

const mapStateToProps = (state, ownProps) => {
  return {
    reverse: state.exporter.reverse,
    scaraGcode: state.exporter.scaraGcode,
    show: state.exporter.show,
    vertices: getAllComputedVertices(state),
    comments: getComments(state),
    input: state.app.input,
    layer: state.layers.current,
    offsetX: (state.machine.rectangular ? (state.machine.minX + state.machine.maxX) / 2.0 : state.machine.maxRadius),
    offsetY: (state.machine.rectangular ? (state.machine.minY + state.machine.maxY) / 2.0 : state.machine.maxRadius),
    width:   (state.machine.rectangular ? (state.machine.maxX - state.machine.minX) : (2.0 * state.machine.maxRadius)),
    height:  (state.machine.rectangular ? (state.machine.maxY - state.machine.minY) : (2.0 * state.machine.maxRadius)),
    maxRadius: (state.machine.rectangular ?
      Math.sqrt(Math.pow(state.machine.maxX - state.machine.minX, 2.0) +
                Math.pow(state.machine.maxY - state.machine.minY, 2.0)) :
      state.machine.maxRadius),
    fileName: state.exporter.fileName,
    fileType: state.exporter.fileType,
    polarRhoMax: state.exporter.polarRhoMax,
    pre: (state.exporter.fileType !== svgTypeName ? state.exporter.pre : ''),
    post: (state.exporter.fileType !== svgTypeName ? state.exporter.post : ''),
    options: new Exporter().getOptions()
  }
}

const exporters = {
  [gcodeTypeName]: GCodeExporter,
  [thrTypeName]: ThetaRhoExporter,
  [svgTypeName]: SvgExporter,
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    open: () => {
      dispatch(updateExporter({show: true}))
    },
    close: () => {
      dispatch(updateExporter({show: false}))
    },
    onChange: (attrs) => {
      dispatch(updateExporter(attrs))
    },
  }
}

class Downloader extends Component {
  // Record this event to google analytics.
  gaRecord(fileType) {
    let savedCode = 'Saved: ' + this.props.input
    if (this.props.input === 'shape' || this.props.input === 'Shape') {
      savedCode = savedCode + ': ' + this.props.layer
    }
    ReactGA.event({
      category: fileType,
      action: savedCode,
    })
  }

  download() {
    let exporter = new exporters[this.props.fileType](this.props)
    let startTime = performance.now()
    let fileName = this.props.fileName

    exporter.export()

    if (!fileName.includes('.')) {
      fileName += exporter.fileExtension
    }

    this.gaRecord(exporter.label)
    this.downloadFile(fileName, exporter.lines.join("\n"))
    this.props.close()

    let endTime = performance.now()
    ReactGA.timing({
      category: exporter.label,
      variable: 'Save Code',
      value: endTime - startTime, // in milliseconds
    })
  }

  // Helper function to take a string and make the user download a text file with that text as the
  // content. I don't really understand this, but I took it from here, and it seems to work:
  // https://stackoverflow.com/a/18197511
  downloadFile(fileName, text) {
    let link = document.createElement('a')
    link.download = fileName

    let fileType = 'text/plain;charset=utf-8'
    if (this.props.fileType === svgTypeName) {
      fileType = 'image/svg+xml;charset=utf-8'
    }
    let blob = new Blob([text],{type: fileType})

    // Windows Edge fix
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(blob, fileName)
    } else {
      link.href = URL.createObjectURL(blob)
      if (document.createEvent) {
        var event = document.createEvent('MouseEvents')
        event.initEvent('click', true, true)
        link.dispatchEvent(event)
      } else {
        link.click()
      }
      URL.revokeObjectURL(link.href)
    }
  }

  render() {
    return (
      <div>
        <Button className="ml-2 mr-3" variant="primary" onClick={this.props.open}>Export</Button>
        <Modal size="lg" show={this.props.show} onHide={this.props.close}>
          <Modal.Header closeButton>
            <Modal.Title>Export to a file</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <DropdownOption
              onChange={this.props.onChange}
              options={this.props.options}
              optionKey="fileType"
              key="fileType"
              index={0}
              model={this.props} />

            <InputOption
              onChange={this.props.onChange}
              options={this.props.options}
              key="fileName"
              optionKey="fileName"
              index={1}
              model={this.props} />

            {this.props.fileType === 'Theta Rho (.thr)' && <InputOption
              onChange={this.props.onChange}
              options={this.props.options}
              key="polarRhoMax"
              optionKey="polarRhoMax"
              index={2}
              model={this.props} />}

            {this.props.fileType === 'GCode (.gcode)' && <CheckboxOption
                onChange={this.props.onChange}
                options={this.props.options}
                optionKey="scaraGcode"
                key="scaraGcode"
                index={2}
                model={this.props} />}
            {this.props.fileType === 'GCode (.gcode)' && <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://github.com/jeffeb3/sandify/wiki/Scara-GCode"
                    >More Information</a>}

            <InputOption
              onChange={this.props.onChange}
              options={this.props.options}
              key="pre"
              optionKey="pre"
              index={3}
              model={this.props} />

            <InputOption
              onChange={this.props.onChange}
              options={this.props.options}
              key="post"
              optionKey="post"
              index={4}
              model={this.props} />

            <Row>
              <Col sm={5}>
              </Col>
              <Col sm={7}>
                See <a target="_blank" rel="noopener noreferrer" href="https://github.com/jeffeb3/sandify/wiki#export-variables"> the wiki </a> for details on available program export variables.
              </Col>
            </Row>

            <div className="mt-2">
              <CheckboxOption
                onChange={this.props.onChange}
                options={this.props.options}
                optionKey="reverse"
                key="reverse"
                index={5}
                model={this.props} />
            </div>
          </Modal.Body>

          <Modal.Footer>
            <Button id="code-close" variant="link" onClick={this.props.close}>Close</Button>
            <Button id="code-download" variant="primary" onClick={this.download.bind(this)}>Download</Button>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Downloader)
