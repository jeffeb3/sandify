import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
    Accordion,
    Card,
    Form,
} from 'react-bootstrap'
import InputOption from '../../components/InputOption'
import CheckboxOption from '../../components/CheckboxOption'
import {
  updateImporter,
  toggleFileAspectRatio
} from './importerSlice'
import './Uploader.scss'
import ReactGA from 'react-ga'
import ThetaRhoImporter from './ThetaRhoImporter'
import GCodeImporter from './GCodeImporter'
import Importer from '../../models/Importer'

const mapStateToProps = (state, ownProps) => {
  return {
    fileName: state.importer.fileName,
    comments: state.importer.comments,
    vertices: state.importer.vertices,
    zoom: state.importer.zoom,
    aspectRatio: state.importer.aspectRatio,
    options: new Importer().getOptions()
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    setZoom: (event) => {
      dispatch(updateImporter({zoom: parseFloat(event.target.value)}))
    },
    toggleAspectRatio: (event) => {
      dispatch(toggleFileAspectRatio())
    },
    onChange: (attrs) => {
      dispatch(updateImporter(attrs))
    },
  }
}

class Uploader extends Component {
  onFileImported(importer, importerProps) {
    this.props.onChange(importerProps)

    this.endTime = performance.now()
    ReactGA.timing({
      category: 'PatternImport',
      variable: 'read' + importer.label,
      value: this.endTime - this.startTime // in milliseconds
    })
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
    }

    reader.readAsText(file)
  }

  render() {
    var commentsRender = this.props.comments.map((comment, index) => {
      return <span key={index}>{comment}<br/></span>
    })

    return (
      <div>
        <Card className="p-3 pb-4">
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

          <CheckboxOption
            onChange={this.props.onChange}
            options={this.props.options}
            optionKey="aspectRatio"
            key="aspectRatio"
            index={1}
            model={this.props} />

          <InputOption
            onChange={this.props.onChange}
            options={this.props.options}
            key="zoom"
            optionKey="zoom"
            index={2}
            model={this.props} />

          { this.props.fileName && <div id="importer-comments" className="mt-4 p-3">
            Name: {this.props.fileName} <br />
            Number of points: {this.props.vertices.length } <br />
            Comments:
            <div className="ml-3">
              { commentsRender }
            </div>
          </div>}
        </Card>

        <div className="p-4">
          <h3>Where to get .thr files</h3>
          Sisyphus machines use theta rho (.thr) files. There is a large community sharing them.
          <ul className="list-unstyled">
            <li><a href="https://reddit.com/u/markyland">Markyland on Reddit</a></li>
            <li><a href="https://github.com/Dithermaster/sisyphus/">Dithermaster's github</a></li>
            <li><a href="https://github.com/SlightlyLoony/JSisyphus">JSisyphus by Slightly Loony</a></li>
            <li><a href="https://reddit.com/r/SisyphusIndustries">Sisyphus on Reddit</a></li>
            <li><a href="https://sisyphus-industries.com/community/community-tracks">Sisyphus Community</a></li>
            <li><a href="http://thejuggler.net/sisyphus/">The Juggler</a></li>
          </ul>

          <h4 className="mt-3">Note about copyrights</h4>
          <p>Be careful and respectful. Understand that the original author put their labor, intensity, and ideas into this art. The creators have a right to own it (and they have a copyright, even if it doesn't say so).</p>
          <p>If you don't have permisson (a license) to use their art, then you shouldn't be. If you do have permission to use their art, then you should be thankful, and I'm sure they would appreciate you sending them a note of thanks. A picture of your table creating their shared art would probably make them smile.</p>
          <p>Someone posting the .thr file to a forum or subreddit probably wants it to be shared, and drawing it on your home table is probably OK. Just be careful if you want to use them for something significant without explicit permission.</p>
          <p>I am not a lawyer.</p>
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Uploader)
