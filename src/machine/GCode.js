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

const getComments = (state) => {

  let comments = [];
  comments.push("Created by Sandify");
  comments.push("");
  comments.push("  https://jeffeb3.github.io/sandify/");
  comments.push("");
  comments.push("  Sandify Version: " + state.sandifyVersion);
  comments.push("");
  comments.push("  Machine Type: " + (state.machine.rectangular ? "Rectangular" : "Polar"));
  if (state.machine.rectangular) {
    comments.push("    MinX: " + state.machine.min_x + " MaxX: " + state.machine.max_x + " MinY: " + state.machine.min_y + " MaxY: " + state.machine.max_y);
  } else {
    comments.push("    Max Radius: " + state.machine.max_radius);
    comments.push("    Force Endpoints: " + state.machine.polarEndpoints);
  }

  switch (state.input) {
    case 0: // shapes
      comments.push("  Content Type: Shapes");
      comments.push("    Starting Size: " + state.startingSize);
      comments.push("    Offset: X: " + state.transform.shapeOffsetX + " Y: " + state.transform.shapeOffsetY);
      switch (state.currentShape) {
        case "Polygon":
          comments.push("    Selected Shape: Polygon");
          comments.push("      Polygon Sides: " + state.shapePolygonSides);
          break;
        case "Star":
          comments.push("    Selected Shape: Star");
          comments.push("      Star Points: " + state.shapeStarPoints);
          comments.push("      Star Ratio: " + state.shapeStarRatio);
          break;
        case "Circle":
          comments.push("    Selected Shape: Circle");
          comments.push("      Circle Lobes: " + state.shapeCircleLobes);
          break;
        case "Vicious1":
          comments.push("    Selected Shape: Vicious1");
          break;
        default:
          comments.push("    Selected Shape: None");
          break;
      }

      comments.push("    Number of Loops: " + state.transform.numLoops);
      comments.push("    Spin: " + state.transform.spinEnabled);
      if (state.transform.spinEnabled) {
        comments.push("      Spin Value: " + state.transform.spinValue);
      }
      comments.push("    Grow: " + state.transform.growEnabled);
      if (state.transform.growEnabled) {
        comments.push("      Grow Value: " + state.transform.growValue);
      }
      comments.push("    Track: " + state.transform.trackEnabled);
      if (state.transform.trackEnabled) {
        comments.push("      Track Count: " + state.transform.trackValue);
        comments.push("      Track Size: " + state.transform.trackLength);
        comments.push("      Track Grow: " + state.transform.trackGrowEnabled);
        if (state.transform.trackGrowEnabled) {
          comments.push("          Track Grow Value: " + state.transform.trackGrow);
        }
      }
      break;
    case 2: // wiper
      comments.push("  Content Type: Wiper");
      comments.push("    Wiper Angle: " + state.wiper.angleDeg);
      comments.push("    Wiper Size: "  + state.wiper.size);
      break;
    case 3: // thetarho
      comments.push("  Content Type: ThetaRho");
      comments.push("    Input File: " + state.file.name);
      comments.push("    Zoom: "  + state.file.zoom);
      comments.push("    Aspect Ratio: " + state.file.aspectRatio);
      break;
    default: // Dunno
      comments.push("  Content Type: Unknown");
      break;
  }
  comments.push("  Path Reversed: " + state.gcodeReverse);
  comments.push("");

  return comments;
};

const gcodeProps = (state, ownProps) => {
  return {
    xOffset: (state.machine.min_x + state.machine.max_x) / 2.0,
    yOffset: (state.machine.min_y + state.machine.max_y) / 2.0,
    settings: getComments(state),
    pre: state.gcodePre,
    post: state.gcodePost,
    reverse: state.gcodeReverse,
    vertices: state.vertices,
    max_radius: state.machine.max_radius,
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
    var content = "; " + this.props.settings.join("\n; ");
    content += "\n";
    content += "; filename: '" + this.props.filename + "'\n\n";
    content += "; BEGIN PRE\n";
    content += this.props.pre;
    content += "; END PRE\n";

    console.log("offset x: " + this.props.xOffset + " y: " + this.props.yOffset);
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
    content += "; BEGIN POST\n";
    content += this.props.post;
    content += "; END POST\n";
    var filename = this.props.filename;
    if (!filename.includes(".")) {
      filename += ".gcode";
    }
    download(filename, content)
    this.props.close();
  }

  generateThetaRho() {
    var content = "# " + this.props.settings.join("\n# ");
    content += "\n";
    content += "# filename: '" + this.props.filename + "'\n\n";
    content += "# BEGIN PRE\n";
    content += this.props.pre;
    content += "# END PRE\n";
    content += '\n';

    // First, downsample larger lines into smaller ones.
    var maxLength = 2.0;
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
      var rawTheta = Math.atan2(subsampledVertices[next].x,
                                subsampledVertices[next].y);
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
    content += "# BEGIN POST\n";
    content += this.props.post;
    content += "# END POST\n";

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
