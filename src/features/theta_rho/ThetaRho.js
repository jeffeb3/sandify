import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
    Accordion,
    Card,
    Col,
    Form,
    Row,
} from 'react-bootstrap'
import Switch from 'react-switch'
import {
  setFileName,
  setFileComments,
  setFileVertices,
  setFileZoom,
  toggleFileAspectRatio
} from './fileSlice'
import './ThetaRho.scss'
import ReactGA from 'react-ga'

const mapStateToProps = (state, ownProps) => {
  return {
    name: state.file.name,
    comments: state.file.comments,
    vertices: state.file.vertices,
    zoom: state.file.zoom,
    aspectRatio: state.file.aspectRatio,
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  var convertToXY = (thetaRhos) => {
    var vertices = []
    var previous = undefined
    var max_angle = Math.PI / 64.0
    for (let ii = 0; ii < thetaRhos.length; ii++) {
      var next = thetaRhos[ii]
      if (previous) {
        if (Math.abs(next[0] - previous[0]) < max_angle) {
          // These sin, cos elements are inverted. I'm not sure why
          vertices.push({
                        x: previous[1] * Math.sin(previous[0]),
                        y: previous[1] * Math.cos(previous[0])
          })
        } else {
          // We need to do some interpolating.
          let deltaAngle = next[0] - previous[0]
          let rhoStep = max_angle / Math.abs(deltaAngle) * (next[1] - previous[1])
          var rho = previous[1]
          if (deltaAngle > 0.0) {
            var emergency_break = 0
            for (let angle = previous[0]; angle < next[0]; angle += max_angle, rho += rhoStep) {
              vertices.push({
                            x: rho * Math.sin(angle),
                            y: rho * Math.cos(angle)
              })
              if (emergency_break++ > 100000) {
                break
              }
            }
          } else {
            for (let angle = previous[0]; angle > next[0]; angle -= max_angle, rho += rhoStep) {
              vertices.push({
                            x: rho * Math.sin(angle),
                            y: rho * Math.cos(angle)
              })
              if (emergency_break++ > 100000) {
                break
              }
            }
          }
        }
      }
      previous = next
    }
    return vertices
  }

  var parseThrFile = (file) => {
    var rv = {}
    rv.comments = []
    rv.vertices = []

    var reader = new FileReader()

    reader.onload = (event) => {
      const startTime = performance.now()
      var text = reader.result
      var lines = text.split('\n')
      var has_vertex = false
      for (let ii = 0; ii < lines.length; ii++) {
        var line = lines[ii].trim()
        if (line.length === 0) {
          // blank lines
          continue
        }
        if (line.indexOf("#") === 0 && !has_vertex) {
          rv.comments.push(lines[ii])
        }

        if (line.indexOf("#") !== 0) {
          has_vertex = true
          // This is a point, let's try to read it.
          var pointStrings = line.split(/\s+/)
          if (pointStrings.length !== 2) {
            // AAAH
            console.log(pointStrings)
            continue
          }
          rv.vertices.push([parseFloat(pointStrings[0]), parseFloat(pointStrings[1])])
        }
      }

      dispatch(setFileComments(rv.comments))
      dispatch(setFileVertices(convertToXY(rv.vertices)))
      const endTime = performance.now()
      ReactGA.timing({
        category: 'ThetaRho',
        variable: 'readThetaRho',
        value: endTime - startTime, // in milliseconds
      });
    }

    reader.readAsText(file)
  }

  return {
    setVertices: (event: any) => {
      var file = event.target.files[0]
      dispatch(setFileName(file.name))
      parseThrFile(file)
    },
    setZoom: (event) => {
      dispatch(setFileZoom(parseFloat(event.target.value)))
    },
    toggleAspectRatio: (event) => {
      dispatch(toggleFileAspectRatio())
    },
  }
}

class ThetaRho extends Component {
  render() {
    var commentsRender = this.props.comments.map((comment) => {
      return <span>{comment}<br/></span>
    })

    return (
      <div className="theta-rho">
        <Card className="p-3 pb-4">
          <Accordion className="mb-4">
            <Card>
              <Card.Header as={Form.Label} htmlFor="fileUpload" style={{ cursor: "pointer" }}>
                <h3>Import</h3>
                Imports a Sisyphus-style theta rho (.thr) file into Sandify
                <Form.Control
                    id="fileUpload"
                    type="file"
                    accept=".thr"
                    onChange={this.props.setVertices}
                    style={{ display: "none" }} />
              </Card.Header>
            </Card>
          </Accordion>

          <Row className="align-items-center">
            <Col sm={5}>
              <Form.Label htmlFor="keepAspectRatio">
                Keep original aspect ratio
              </Form.Label>
            </Col>
            <Col sm={7}>
              <Switch checked={this.props.aspectRatio} onChange={this.props.toggleAspectRatio} />
            </Col>
          </Row>

          <Row className="align-items-center pt-1">
            <Col sm={5}>
              <Form.Label htmlFor="thr-zoom">
                Zoom
              </Form.Label>
            </Col>
            <Col sm={7}>
              <Form.Control type="number" id="thr-zoom" value={this.props.zoom} onChange={this.props.setZoom} />
            </Col>
          </Row>

          { this.props.name && <div id="theta-rho-comments" className="mt-4 p-3">
            Name: {this.props.name} <br />
            Comments:
            <div className="ml-3">
              { commentsRender }
            </div>
            Number of points: {this.props.vertices.length }
          </div>}
        </Card>

        <div className="p-4">
          <h3>Where to get .thr files</h3>
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

export default connect(mapStateToProps, mapDispatchToProps)(ThetaRho)
