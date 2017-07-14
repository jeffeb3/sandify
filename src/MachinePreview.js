import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './MachinePreview.css';
import Vertex from './Geometry';
import MachineSettings from './MachineSettings.js';
import { connect } from 'react-redux'

const mapStateToProps = (state, ownProps) => {
  return {
    min_x: state.min_x,
    max_x: state.max_x,
    min_y: state.min_y,
    max_y: state.max_y,
    vertices: state.vertices,
  }
}

// Contains the preview window, and any paremeters for the machine.
class PreviewWindow extends Component {

  componentDidMount() {
    var context = ReactDOM.findDOMNode(this).getContext('2d');
    this.paint(context);
  }

  componentDidUpdate() {
    var context = ReactDOM.findDOMNode(this).getContext('2d');
    context.clearRect(0, 0, this.props.canvas_width, this.props.canvas_height);
    this.paint(context);
  }

  // in mm means in units of mm, but 0,0 is the center, not the lower corner or something.
  mmToPixelsScale() {
    var machine_x = this.props.max_x - this.props.min_x;
    var machine_y = this.props.max_y - this.props.min_y;
    var scale_x = this.props.canvas_width / machine_x;
    var scale_y = this.props.canvas_height / machine_y;
    // Keep it square.
    return Math.min(scale_x, scale_y) * 0.95;
  }

  mmToPixels(vertex) {
    var min_scale = this.mmToPixelsScale()

    var x = vertex.x * min_scale + this.props.canvas_width/2.0;
    // Y for pixels starts at the top, and goes down.
    var y = -vertex.y * min_scale + this.props.canvas_height/2.0;

    return Vertex(x, y);
  }

  moveTo_mm(context, vertex) {
    var in_mm = this.mmToPixels(vertex);
    context.moveTo(in_mm.x, in_mm.y)
  }

  lineTo_mm(context, vertex) {
    var in_mm = this.mmToPixels(vertex);
    context.lineTo(in_mm.x, in_mm.y)
  }

  paint(context) {
    context.save();

    // Draw the bounds of the machine
    context.beginPath();
    context.lineWidth = "1";
    context.strokeStyle = "blue";
    this.moveTo_mm(context, Vertex((this.props.min_x - this.props.max_x)/2.0, (this.props.min_y - this.props.max_y)/2.0))
    this.lineTo_mm(context, Vertex((this.props.max_x - this.props.min_x)/2.0, (this.props.min_y - this.props.max_y)/2.0))
    this.lineTo_mm(context, Vertex((this.props.max_x - this.props.min_x)/2.0, (this.props.max_y - this.props.min_y)/2.0))
    this.lineTo_mm(context, Vertex((this.props.min_x - this.props.max_x)/2.0, (this.props.max_y - this.props.min_y)/2.0))
    this.lineTo_mm(context, Vertex((this.props.min_x - this.props.max_x)/2.0, (this.props.min_y - this.props.max_y)/2.0))
    context.stroke();

    // Draw the vertices
    context.beginPath();
    context.lineWidth = this.mmToPixelsScale();
    context.strokeStyle = "green";
    this.moveTo_mm(context, Vertex(0,0));
    for (var i=0; i<this.props.vertices.length; i++) {
      this.lineTo_mm(context, this.props.vertices[i]);
    }
    context.stroke();
    context.restore();
  }

  render() {
    const {canvas_width, canvas_height} = this.props;
    return (
      <canvas className="canvas"
        width={canvas_width}
        height={canvas_height}
      />
    );
  }
}
PreviewWindow = connect(mapStateToProps)(PreviewWindow);

class MachinePreview extends Component {
  render() {
    return (
      <div className="machine-preview">
        <MachineSettings />
        <PreviewWindow
          canvas_width={this.props.canvas_width}
          canvas_height={this.props.canvas_height}
        />
      </div>
    )
  }
}

export default MachinePreview;

