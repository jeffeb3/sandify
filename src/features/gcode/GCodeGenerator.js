import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  Accordion,
  Button,
  Form,
  Modal,
  Card
} from 'react-bootstrap'
import {
  setGCodeFilename,
  setGCodePre,
  setGCodePost,
  setGCodeShow,
  toggleGCodeReverse,
} from './gCodeSlice'
import { getComments } from './selectors'
import { getVertices } from '../machine/selectors'
import { Vertex } from '../../common/Geometry'
import Victor from 'victor'

// Helper function to take a string and make the user download a text file with that text as the
// content.
// I don't really understand this, but I took it from here, and it seems to work:
// https://stackoverflow.com/a/18197511
function download(filename, text) {
  let link = document.createElement('a')
  link.download = filename

  let blob = new Blob([text],{type: 'text/plain;charset=utf-8'})

  // Windows Edge fix
  if (window.navigator && window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(blob, filename)
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

function gcode(vertex) {
  var command = 'G01' +
    ' X' + vertex.x.toFixed(3) +
    ' Y' + vertex.y.toFixed(3)
  if (vertex.speed > 0.0) {
    command += ' F' + vertex.f
  }
  return command + '\n'
}

function thetarho(vertex) {
  return "" + vertex.x.toFixed(5) + " " + vertex.y.toFixed(5) + "\n"
}

const mapStateToProps = (state, ownProps) => {
  return {
    reverse: state.gcode.reverse,
    show: state.gcode.show,
    vertices: getVertices(state),
    settings: getComments(state),
    offsetX: (state.machine.minX + state.machine.maxX) / 2.0,
    offsetY: (state.machine.minY + state.machine.maxY) / 2.0,
    maxRadius: state.machine.maxRadius,
    filename: state.gcode.filename,
    pre: state.gcode.pre,
    post: state.gcode.post,
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    open: () => {
      dispatch(setGCodeShow(true))
    },
    close: () => {
      dispatch(setGCodeShow(false))
    },
    toggleReverse: () => {
      dispatch(toggleGCodeReverse())
    },
    setFilename: (event) => {
      dispatch(setGCodeFilename(event.target.value))
    },
    setPre: (event) => {
      dispatch(setGCodePre(event.target.value))
    },
    setPost: (event) => {
      dispatch(setGCodePost(event.target.value))
    },
  }
}

// A class that will encapsulate all the gcode generation. This is currently just a button that
// converts vertices and a speed into a list of positions. There is a lot more than could exists
// here.
class GCodeGenerator extends Component {
  generateGCode() {
    var content = "; " + this.props.settings.join("\n; ")
    content += "\n"
    content += "; filename: '" + this.props.filename + "'\n\n"
    content += "; BEGIN PRE\n"
    content += this.props.pre
    content += "; END PRE\n"

    console.log("offset x: " + this.props.offsetX + " y: " + this.props.offsetY)
    var centeredVertices = this.props.vertices.map( (vertex) => {
      return {
        ...vertex,
        x: vertex.x + this.props.offsetX,
        y: vertex.y + this.props.offsetY,
      }
    })

    var lines = centeredVertices.map(gcode)
    content += lines.join('')
    content += '\n'
    content += "; BEGIN POST\n"
    content += this.props.post
    content += "; END POST\n"

    var filename = this.props.filename
    if (!filename.includes(".")) {
      filename += ".gcode"
    }

    download(filename, content)
    this.props.close()
  }

  generateThetaRho() {
    var content = "# " + this.props.settings.join("\n# ")
    content += "\n"
    content += "# filename: '" + this.props.filename + "'\n\n"
    content += "# BEGIN PRE\n"
    content += this.props.pre
    content += "# END PRE\n"
    content += '\n'

    // First, downsample larger lines into smaller ones.
    var maxLength = 2.0
    var subsampledVertices = []
    var previous = undefined
    var next
    for (next = 0; next < this.props.vertices.length; next++) {
      if (previous !== undefined) {
        var start = Victor.fromObject(this.props.vertices[previous])
        var end = Victor.fromObject(this.props.vertices[next])

        var delta = end.clone().subtract(start)
        var deltaSegment = end.clone().subtract(start).normalize().multiply(Victor(maxLength, maxLength))

        // This loads up (start, end].
        for (let step = 0; step < (delta.magnitude() / maxLength) ; step++) {
          subsampledVertices.push(Vertex(start.x + step * deltaSegment.x,
                                         start.y + step * deltaSegment.y,
                                         this.props.vertices[next].f))
        }

      }
      previous = next
    }
    // Add in the end.
    if (previous !== undefined) {
      subsampledVertices.push(this.props.vertices[this.props.vertices.length - 1])
    }

    // Convert to Theta, Rho
    var trVertices = []
    var previousTheta = 0
    var previousRawTheta = 0
    for (next = 0; next < subsampledVertices.length; ++next) {
      // Normalize the radius
      var rho = Victor.fromObject(subsampledVertices[next]).magnitude() / this.props.maxRadius

      // What is the basic theta for this point?
      var rawTheta = Math.atan2(subsampledVertices[next].x,
                                subsampledVertices[next].y)
      // Convert to [0,2pi]
      rawTheta = (rawTheta + 2.0 * Math.PI) % (2.0 * Math.PI)

      // Compute the difference to the last point.
      var deltaTheta = rawTheta - previousRawTheta
      // Convert to [-pi,pi]
      if (deltaTheta < -Math.PI) {
        deltaTheta += 2.0 * Math.PI
      }
      if (deltaTheta > Math.PI) {
        deltaTheta -= 2.0 * Math.PI
      }
      var theta = previousTheta + deltaTheta
      previousRawTheta = rawTheta
      previousTheta = theta

      trVertices.push(Vertex(theta, rho, subsampledVertices[next].f))
    }

    var lines = trVertices.map(thetarho)

    content += lines.join('')

    content += '\n'
    content += "# BEGIN POST\n"
    content += this.props.post
    content += "# END POST\n"

    var filename = this.props.filename
    if (!filename.includes(".")) {
      filename += ".thr"
    }
    download(filename, content)

    this.props.close()
  }

  render() {
    var reverseActiveClass = (this.props.reverse ? "active" : null)

    return (
      <div>
        <Button className="mt-3 p-3 btn-block" variant="secondary" onClick={this.props.open}>Generate code</Button>

        <Modal show={this.props.show} onHide={this.props.close}>
          <Modal.Header closeButton>
            <Modal.Title>Code Parameters</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Form.Group controlId="sandify-filename">
              <Form.Label>Name of output</Form.Label>
              <Form.Control type="text" value={this.props.filename} onChange={this.props.setFilename} />
            </Form.Group>

            <Form.Group controlId="pre-code">
              <Form.Label>Program start code</Form.Label>
              <Form.Control as="textarea" value={this.props.pre} onChange={this.props.setPre} />
            </Form.Group>

            <Form.Group controlId="post-code">
              <Form.Label>Program end code</Form.Label>
              <Form.Control as="textarea" value={this.props.post} onChange={this.props.setPost} />
            </Form.Group>

            <Accordion>
              <Card className={`${reverseActiveClass} overflow-auto`}>
                <Accordion.Toggle as={Card.Header} eventKey={0} onClick={this.props.toggleReverse}>
                  <h3>Reverse path</h3>
                  Reverses the code, starting at the final location
                </Accordion.Toggle>
              </Card>
            </Accordion>
          </Modal.Body>

          <Modal.Footer>
            <Button id="code-close" variant="link" onClick={this.props.close}>Close</Button>
            <Button id="code-gen-gcode" variant="primary" onClick={this.generateGCode.bind(this)}>Generate GCode</Button>
            <Button id="code-gen-thetarho" variant="primary" onClick={this.generateThetaRho.bind(this)}>Generate Theta Rho</Button>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GCodeGenerator)
