import React, { Component } from 'react';
import {
    Button,
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

function gcode(vertex) {
  var command = 'G01' +
    ' X' + vertex.x.toFixed(3) +
    ' Y' + vertex.y.toFixed(3)
  if (vertex.speed > 0.0) {
    command += ' F' + vertex.f
  }
  return command + '\n'
}

// A class that will encapsulate all the gcode generation. This is currently just a button that
// converts vertices and a speed into a list of positions. There is a lot more than could exists
// here.
class GCodeGenerator extends Component {

  generateGCode() {
    var content = ""
    for (var i=0; i<this.props.vertices.length; i++) {
      content += gcode(this.props.vertices[i]);
    }
    download('sandify.gcode', content)
  }

  render() {
    return (
      <Button id="gcode" bsStyle="primary" onClick={this.generateGCode.bind(this)}>Generate GCode</Button>
    );
  }
}

export default GCodeGenerator
