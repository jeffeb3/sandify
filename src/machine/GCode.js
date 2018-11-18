import './GCode.css';
import React, { Component } from 'react';
import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  ListGroupItem,
  Modal,
} from 'react-bootstrap'
import { connect } from 'react-redux'
import {
  setShowGCode,
  setGCodeFilename,
  setGCodePre,
  setGCodePost,
  toggleGCodeReverse,
} from '../reducers/Index.js';
import {
  Vertex,
} from '../Geometry.js'
import Victor from 'victor';

// Helper function to take a string and make the user download a text file with that text as the
// content.
//
// I don't really understand this, but I took it from here, and it seems to work:
// https://stackoverflow.com/a/18197511
//
function download(filename, text) {
  var pom = document.createElement('a');
  pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  pom.setAttribute('download', filename);

  if (document.createEvent) {
    var event = document.createEvent('MouseEvents');
    event.initEvent('click', true, true);
    pom.dispatchEvent(event);
  }
  else {
    pom.click();
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
  return "" + vertex.x.toFixed(5) + " " + vertex.y.toFixed(5) + "\n";
}

const gcodeProps = (state, ownProps) => {
  return {
    xOffset: (state.min_x + state.max_x) / 2.0,
    yOffset: (state.min_y + state.max_y) / 2.0,
    pre: state.gcodePre,
    post: state.gcodePost,
    reverse: state.gcodeReverse,
    vertices: state.vertices,
    max_radius: state.max_radius,
    show: state.showGCode,
    filename: state.filename,
  }
}

const gcodeDispatch = (dispatch, ownProps) => {
  return {
    open: () => {
      dispatch(setShowGCode(true));
    },
    close: () => {
      dispatch(setShowGCode(false));
    },
    toggleReverse: () => {
      dispatch(toggleGCodeReverse());
    },
    setFilename: (event) => {
      dispatch(setGCodeFilename(event.target.value));
    },
    setPre: (event) => {
      dispatch(setGCodePre(event.target.value));
    },
    setPost: (event) => {
      dispatch(setGCodePost(event.target.value));
    },
  }
}

// A class that will encapsulate all the gcode generation. This is currently just a button that
// converts vertices and a speed into a list of positions. There is a lot more than could exists
// here.
class GCodeGenerator extends Component {

  generateGCode() {
    var content = this.props.pre;
    content += '\n';

    var centeredVertices = this.props.vertices.map( (vertex) => {
      return {
        ...vertex,
        x: vertex.x + this.props.xOffset,
        y: vertex.y + this.props.yOffset,
      }
    });

    var lines = centeredVertices.map(gcode);

    content += lines.join('');

    content += '\n';
    content += this.props.post;
    var filename = this.props.filename;
    if (!filename.includes(".")) {
      filename += ".gcode";
    }
    download(filename, content)
    this.props.close();
  }

  // What resolution?
  // What name/extension?
  // Does pre/post make any sense?
  generateThetaRho() {
    var content = this.props.pre;
    content += '\n';

    // First, downsample larger lines into smaller ones.
    var maxLength = 2.5; // A bit arbitrary, don't you think?
    var subsampledVertices = [];
    var previous = undefined;
    var next;
    for (next = 0; next < this.props.vertices.length; next++) {
      if (previous !== undefined) {
        var start = Victor.fromObject(this.props.vertices[previous]);
        var end = Victor.fromObject(this.props.vertices[next]);

        var delta = end.clone().subtract(start);
        var deltaSegment = end.clone().subtract(start).normalize().multiply(Victor(maxLength, maxLength));

        // This loads up (start, end].
        for (let step = 0; step < (delta.magnitude() / maxLength) ; step++) {
          subsampledVertices.push(Vertex(start.x + step * deltaSegment.x,
                                         start.y + step * deltaSegment.y,
                                         this.props.vertices[next].f));
        }

      }
      previous = next;
    }
    // Add in the end.
    if (previous !== undefined) {
      subsampledVertices.push(this.props.vertices[this.props.vertices.length - 1]);
    }

    // Convert to Theta, Rho
    var trVertices = [];
    var previousTheta = 0;
    var previousRawTheta = 0;
    for (next = 0; next < subsampledVertices.length; ++next) {
      // Normalize the radius
      var rho = Victor.fromObject(subsampledVertices[next]).magnitude() / this.props.max_radius;

      // What is the basic theta for this point?
      var rawTheta = Math.atan2(subsampledVertices[next].y,
                                subsampledVertices[next].x);
      // Convert to [0,2pi]
      rawTheta = (rawTheta + 2.0 * Math.PI) % (2.0 * Math.PI);

      // Compute the difference to the last point.
      var deltaTheta = rawTheta - previousRawTheta;
      // Convert to [-pi,pi]
      if (deltaTheta < -Math.PI) {
        deltaTheta += 2.0 * Math.PI;
      }
      if (deltaTheta > Math.PI) {
        deltaTheta -= 2.0 * Math.PI;
      }
      var theta = previousTheta + deltaTheta;
      previousRawTheta = rawTheta;
      previousTheta = theta;

      trVertices.push(Vertex(theta, rho, subsampledVertices[next].f));
    }

    var lines = trVertices.map(thetarho);

    content += lines.join('');

    content += '\n';
    content += this.props.post;

    var filename = this.props.filename;
    if (!filename.includes(".")) {
      filename += ".thr";
    }
    download(filename, content)

    this.props.close();
  }

  render() {
    const reverseActiveClass = (this.props.reverse ? "active" : null);
    return (
      <div>
        <Button className="finishButton" bsStyle="primary" bsSize="large" onClick={this.props.open}>Create Code</Button>
        <Modal show={this.props.show} onHide={this.props.close}>
          <Modal.Header closeButton>
            <Modal.Title>Code Parameters</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <FormGroup controlId="sandifyFilename">
              <ControlLabel>Name of Output</ControlLabel>
              <FormControl type="text" value={this.props.filename} onChange={this.props.setFilename}/>
            </FormGroup>
            <FormGroup controlId="preCode">
              <ControlLabel>Program Start Code</ControlLabel>
              <FormControl componentClass="textarea" value={this.props.pre} onChange={this.props.setPre}/>
            </FormGroup>
            <FormGroup controlId="postCode">
              <ControlLabel>Program End Code</ControlLabel>
              <FormControl componentClass="textarea" value={this.props.post} onChange={this.props.setPost}/>
            </FormGroup>
            <ListGroupItem header="Reverse Path" className={reverseActiveClass} onClick={this.props.toggleReverse}>Reverses the Code, starting at the final location</ListGroupItem>
          </Modal.Body>
          <Modal.Footer>
            <Button id="code-close" bsStyle="default" onClick={this.props.close}>Close</Button>
            <Button id="code-gen-gcode" bsStyle="primary" onClick={this.generateGCode.bind(this)}>Generate GCode</Button>
            <Button id="code-gen-thetarho" bsStyle="primary" onClick={this.generateThetaRho.bind(this)}>Generate Theta Rho</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}
GCodeGenerator = connect(gcodeProps, gcodeDispatch)(GCodeGenerator);

export default GCodeGenerator
