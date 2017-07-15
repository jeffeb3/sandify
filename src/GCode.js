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
  setGCodePre,
  setGCodePost,
  toggleGCodeReverse,
} from './reducers/Index.js';

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

const gcodeProps = (state, ownProps) => {
  return {
    pre: state.gcodePre,
    post: state.gcodePost,
    reverse: state.gcodeReverse,
    vertices: state.vertices,
    show: state.showGCode,
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

    var lines = this.props.vertices.map(gcode);
    if (this.props.reversePath) {
      lines.reverse();
    }
    content += lines.join('');

    content += '\n';
    content += this.props.post;
    download('sandify.gcode', content)
    this.props.close();
  }

  render() {
    const activeClassName = (this.props.reverse ? "active" : null);
    return (
      <div>
        <Button bsStyle="primary" bsSize="large" onClick={this.props.open}>GCode</Button>
        <Modal show={this.props.show}>
          <Modal.Header closeButton>
            <Modal.Title>GCode Parameters</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <FormGroup controlId="preCode">
              <ControlLabel>Program Start Code</ControlLabel>
              <FormControl componentClass="textarea" value={this.props.pre} onChange={this.props.setPre}/>
            </FormGroup>
            <FormGroup controlId="postCode">
              <ControlLabel>Program End Code</ControlLabel>
              <FormControl componentClass="textarea" value={this.props.post} onChange={this.props.setPost}/>
            </FormGroup>
            <ListGroupItem header="Reverse Path" className={activeClassName} onClick={this.props.toggleReverse}>Reverses the GCode, starting at the final location</ListGroupItem>
          </Modal.Body>
          <Modal.Footer>
            <Button id="gcode" bsStyle="default" onClick={this.props.close}>Close</Button>
            <Button id="gcode" bsStyle="primary" onClick={this.generateGCode.bind(this)}>Generate GCode</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}
GCodeGenerator = connect(gcodeProps, gcodeDispatch)(GCodeGenerator);

export default GCodeGenerator
