import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  Button,
  Modal
} from 'react-bootstrap'
import DropdownOption from '../../components/DropdownOption'
import InputOption from '../../components/InputOption'
import CheckboxOption from '../../components/CheckboxOption'
import { updateExporter } from './exporterSlice'
import { getComments } from './selectors'
import { getVertices } from '../machine/selectors'
import ReactGA from 'react-ga'
import ThetaRhoExporter from './ThetaRhoExporter'
import GCodeExporter from './GCodeExporter'
import Exporter from '../../models/Exporter'

const mapStateToProps = (state, ownProps) => {
  return {
    reverse: state.exporter.reverse,
    show: state.exporter.show,
    vertices: getVertices(state),
    comments: getComments(state),
    input: state.app.input,
    shape: state.shapes.currentId,
    offsetX: (state.machine.minX + state.machine.maxX) / 2.0,
    offsetY: (state.machine.minY + state.machine.maxY) / 2.0,
    maxRadius: state.machine.maxRadius,
    fileName: state.exporter.fileName,
    fileType: state.exporter.fileType,
    pre: state.exporter.pre,
    post: state.exporter.post,
    options: new Exporter().getOptions()
  }
}

const exporters = {
  'GCode (.gcode)': GCodeExporter,
  'Theta Rho (.thr)': ThetaRhoExporter
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
      savedCode = savedCode + ': ' + this.props.shape
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

    let blob = new Blob([text],{type: 'text/plain;charset=utf-8'})

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
        <Modal show={this.props.show} onHide={this.props.close}>
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

            <InputOption
              onChange={this.props.onChange}
              options={this.props.options}
              key="pre"
              optionKey="pre"
              index={2}
              model={this.props} />

            <InputOption
              onChange={this.props.onChange}
              options={this.props.options}
              key="post"
              optionKey="post"
              index={3}
              model={this.props} />

            <CheckboxOption
              onChange={this.props.onChange}
              options={this.props.options}
              optionKey="reverse"
              key="reverse"
              index={4}
              model={this.props} />
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
