import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
    Accordion,
    Card,
    Col,
    Form,
    Row,
} from 'react-bootstrap'
import Toolpath from 'gcode-toolpath';
import Switch from 'react-switch'
import {
  setFileName,
  setFileComments,
  setFileVertices,
  setFileZoom,
  toggleFileAspectRatio
} from './fileSlice'
import './PatternImport.scss'
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
        category: 'PatternImport',
        variable: 'readThetaRho',
        value: endTime - startTime, // in milliseconds
      });
    }

    reader.readAsText(file)
  }

  // We want to scale and center the pattern. This may mess up some patterns which were off center,
  // but there are so many machine coordinates, it will be just too annoying if we don't.
  var normalizeCoords = (vertices) => {
    let minX = 1e9
    let minY = 1e9
    let maxX = -1e9
    let maxY = -1e9
    vertices.forEach( (vertex) => {
      minX = Math.min(vertex.x, minX)
      minY = Math.min(vertex.y, minY)
      maxX = Math.max(vertex.x, maxX)
      maxY = Math.max(vertex.y, maxY)
    })
    const offsetX = (maxX + minX)/2.0
    const offsetY = (maxY + minY)/2.0

    const scaleX = 0.97/(maxX - offsetX)
    const scaleY = 0.97/(maxY - offsetY)

    return vertices.map( (vertex) => {
      return {
        x: scaleX * (vertex.x - offsetX),
        y: scaleY * (vertex.y - offsetY)
      }
    })
  }

  var parseGcodeFile = (file) => {
    let rv = {}
    rv.comments = []
    rv.vertices = []

    let reader = new FileReader()

    // This assumes the line is already trimmed and not empty.
    // The paranthesis isn't perfect, since it usually has a match, but I don't think anyone will
    // care. I think there are firmwares that do this same kind of hack.
    var isComment = (line) => {
      return (line.indexOf(";") === 0) || (line.indexOf('(') === 0)
    }

    reader.onload = (event) => {
      const startTime = performance.now()
      var text = reader.result
      var lines = text.split('\n')

      // Read the initial comments
      for (let ii = 0; ii < lines.length; ii++) {
        var line = lines[ii].trim()
        if (line.length === 0) {
          // blank lines
          continue
        }
        if (isComment(line)) {
          rv.comments.push(lines[ii])
        } else {
          break
        }
      }

      var addVertex = (x, y) => {
        rv.vertices.push({x: x,y: y})
      }

      // GCode reader object. More info here:
      // https://github.com/cncjs/gcode-toolpath/blob/master/README.md
      const toolpath = new Toolpath({
        // @param {object} modal The modal object.
        // @param {object} v1 A 3D vector of the start point.
        // @param {object} v2 A 3D vector of the end point.
        addLine: (modal, v1, v2) => {
          if (v1.x !== v2.x || v1.y !== v2.y) {
            addVertex(v2.x, v2.y)
          }
        },
        // @param {object} modal The modal object.
        // @param {object} v1 A 3D vector of the start point.
        // @param {object} v2 A 3D vector of the end point.
        // @param {object} v0 A 3D vector of the fixed point.
        addArcCurve: (modal, v1, v2, v0) => {
          if (v1.x !== v2.x || v1.y !== v2.y) {
            // We can't use traceCircle, we have to go a specific direction (not the shortest path).
            let startTheta = Math.atan2(v1.y-v0.y, v1.x-v0.x)
            let endTheta   = Math.atan2(v2.y-v0.y, v2.x-v0.x)
            let deltaTheta = endTheta - startTheta
            const radius   = Math.sqrt(Math.pow(v2.x-v0.x, 2.0) + Math.pow(v2.y-v0.y, 2.0))
            let direction  = 1.0 // Positive, so anticlockwise.

            // Clockwise
            if (modal.motion === 'G2') {
              if (deltaTheta > 0.0) {
                endTheta -= 2.0*Math.PI
                deltaTheta -= 2.0*Math.PI
              }
              direction = -1.0
            } else if (modal.motion === 'G3') {
              // Anti-clockwise
              if (deltaTheta < 0.0) {
                endTheta += 2.0*Math.PI
                deltaTheta += 2.0*Math.PI
              }
            }

            // What angle do we need to have a resolution of approx. 0.5mm?
            const arcResolution = 0.5
            const arcLength = Math.abs(deltaTheta) * radius
            const thetaStep = deltaTheta * arcResolution/arcLength
            for (let theta = startTheta;
                 direction * theta <= direction * endTheta;
                 theta += thetaStep) {
              addVertex(v0.x + radius * Math.cos(theta), v0.y + radius * Math.sin(theta))
            }
            // Save the final point, in case our math didn't quite get there.
            addVertex(v2.x, v2.y)
            console.log(rv.vertices)
          }
        }
      });

      toolpath
        .loadFromString(text, (err, results) => {
          dispatch(setFileComments(rv.comments))
          dispatch(setFileVertices(normalizeCoords(rv.vertices)))
          const endTime = performance.now()
          ReactGA.timing({
            category: 'PatternImport',
            variable: 'readGCode',
            value: endTime - startTime, // in milliseconds
          });
        })

    }

    reader.readAsText(file)
  }

  return {
    setVertices: (event: any) => {
      var file = event.target.files[0]
      dispatch(setFileName(file.name))
      if (file.name.toLowerCase().endsWith('.thr')) {
        parseThrFile(file)
      } else if (file.name.toLowerCase().endsWith('.gcode') || file.name.toLowerCase().endsWith('.nc')) {
        parseGcodeFile(file)
      }

    },
    setZoom: (event) => {
      dispatch(setFileZoom(parseFloat(event.target.value)))
    },
    toggleAspectRatio: (event) => {
      dispatch(toggleFileAspectRatio())
    },
  }
}

class PatternImport extends Component {
  render() {
    var commentsRender = this.props.comments.map((comment, index) => {
      return <span key={index}>{comment}<br/></span>
    })

    return (
      <div className="pattern-import">
        <Card className="p-3 pb-4">
          <Accordion className="mb-4">
            <Card>
              <Card.Header as={Form.Label} htmlFor="fileUpload" style={{ cursor: "pointer" }}>
                <h3>Import</h3>
                Imports a Sisyphus-style theta rho (.thr) file into Sandify
                <Form.Control
                    id="fileUpload"
                    type="file"
                    accept=".thr,.gcode,.nc"
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

          { this.props.name && <div id="pattern-import-comments" className="mt-4 p-3">
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

export default connect(mapStateToProps, mapDispatchToProps)(PatternImport)
