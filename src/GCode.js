import React, { Component } from 'react';
import {
    Button,
    ControlLabel,
    FormControl,
    FormGroup,
    ListGroupItem,
    Modal,
} from 'react-bootstrap'

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

function formatNumber(number) {
  // Gcode doesn't like 4+ decimal places
  var int_part = Math.floor(number);
  var other_part = (number % 1).toPrecision(3);
  return int_part + other_part;
}

function gcode(vertex) {
  var command = 'G01' +
    ' X' + formatNumber(vertex.x) +
    ' Y' + formatNumber(vertex.y)
  if (vertex.speed > 0.0) {
    command += ' F' + vertex.f
  }
  return command + '\n'
}

// A class that will encapsulate all the gcode generation. This is currently just a button that
// converts vertices and a speed into a list of positions. There is a lot more than could exists
// here.
class GCodeGenerator extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showSettings: false,
      reversePath: false,
      preCode: '',
      postCode: '',
    }

    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this.generateGCode = this.generateGCode.bind(this);
    this.writePre = this.writePre.bind(this);
    this.writePost = this.writePost.bind(this);
    this.toggleReverse = this.toggleReverse.bind(this);
  }

  open() {
    this.setState({ showSettings: true });
  }

  close() {
    this.setState({ showSettings: false });
  }

  generateGCode() {
    var content = this.state.preCode
    content += '\n';

    var lines = this.props.vertices.map(gcode);
    if (this.state.reversePath) {
      lines.reverse();
    }
    content += lines.join('');

    content += '\n';
    content += this.state.postCode;
    download('sandify.gcode', content)
    this.close()
  }


  writePre(event) {
    this.setState({preCode: event.target.value});
  }

  writePost(event) {
    this.setState({postCode: event.target.value});
  }

  toggleReverse(event) {
    this.setState({reversePath: !this.state.reversePath});
    console.log(event);
  }

  render() {
    const activeClassName = (this.state.reversePath ? "active" : null);
    return (
      <div>
        <Button bsStyle="primary" bsSize="large" onClick={this.open}>GCode</Button>
        <Modal show={this.state.showSettings}>
          <Modal.Header closeButton>
            <Modal.Title>GCode Parameters</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <FormGroup controlId="preCode">
              <ControlLabel>Program Start Code</ControlLabel>
              <FormControl componentClass="textarea" value={this.state.preCode} onChange={this.writePre}/>
            </FormGroup>
            <FormGroup controlId="postCode">
              <ControlLabel>Program End Code</ControlLabel>
              <FormControl componentClass="textarea" value={this.state.postCode} onChange={this.writePost}/>
            </FormGroup>
            <ListGroupItem header="Reverse Path" className={activeClassName} onClick={this.toggleReverse}>Reverses the GCode, starting at the final location</ListGroupItem>
          </Modal.Body>
          <Modal.Footer>
            <Button id="gcode" bsStyle="default" onClick={this.close}>Close</Button>
            <Button id="gcode" bsStyle="primary" onClick={this.generateGCode}>Generate GCode</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default GCodeGenerator
