import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './MachinePreview.css';
import { Vertex } from '../Geometry';
import MachineSettings from './MachineSettings.js';
import { connect } from 'react-redux'
import { Panel } from 'react-bootstrap'
import {
  setMachinePreviewSize,
} from '../reducers/Index.js';

const mapStateToProps = (state, ownProps) => {
  return {
    use_rect: state.machineRectActive,
    min_x: state.min_x,
    max_x: state.max_x,
    min_y: state.min_y,
    max_y: state.max_y,
    max_radius: state.max_radius,
    canvas_width: state.canvas_width,
    canvas_height: state.canvas_height,
    vertices: state.vertices,
    trackVertices: state.trackVertices,
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onResize: (size) => {
      dispatch(setMachinePreviewSize(size))
    },
  }
}

// Contains the preview window, and any paremeters for the machine.
class PreviewWindow extends Component {

  componentDidMount() {
    var canvas = ReactDOM.findDOMNode(this);
    var context = canvas.getContext('2d');
    var bigBox = document.getElementById("biggerBox");
    this.resize(canvas, bigBox);
    window.addEventListener('resize', () => { this.resize(canvas, bigBox) }, false);
    this.paint(context);
  }

  componentDidUpdate() {
    var canvas = ReactDOM.findDOMNode(this);
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, this.props.canvas_width, this.props.canvas_height);
    var bigBox = document.getElementById("biggerBox");
    this.resize(canvas, bigBox);
    this.paint(context);
  }

  // in mm means in units of mm, but 0,0 is the center, not the lower corner or something.
  mmToPixelsScale() {

    var machine_x = 1;
    var machine_y = 1;
    if (this.props.use_rect) {
      machine_x = this.props.max_x - this.props.min_x;
      machine_y = this.props.max_y - this.props.min_y;
    } else {
      machine_x = this.props.max_radius * 2.0;
      machine_y = machine_x;
    }

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

  dot_mm(context, vertex) {
    var in_mm = this.mmToPixels(vertex);
    context.arc(in_mm.x, in_mm.y, Math.max(4.0, this.mmToPixelsScale() * 1.5), 0, 2 * Math.PI, true);
    context.fillStyle = context.strokeStyle;
    context.fill();
  }

  paint(context) {
    context.save();

    // Draw the bounds of the machine
    context.beginPath();
    context.lineWidth = "1";
    context.strokeStyle = "blue";
    if (this.props.use_rect) {
      this.moveTo_mm(context, Vertex((this.props.min_x - this.props.max_x)/2.0, (this.props.min_y - this.props.max_y)/2.0))
      this.lineTo_mm(context, Vertex((this.props.max_x - this.props.min_x)/2.0, (this.props.min_y - this.props.max_y)/2.0))
      this.lineTo_mm(context, Vertex((this.props.max_x - this.props.min_x)/2.0, (this.props.max_y - this.props.min_y)/2.0))
      this.lineTo_mm(context, Vertex((this.props.min_x - this.props.max_x)/2.0, (this.props.max_y - this.props.min_y)/2.0))
      this.lineTo_mm(context, Vertex((this.props.min_x - this.props.max_x)/2.0, (this.props.min_y - this.props.max_y)/2.0))
    } else {
      this.moveTo_mm(context, Vertex(this.props.max_radius, 0.0));
      let resolution = 128.0;
      for (let i=0; i<=resolution ; i++) {
        let angle = Math.PI * 2.0 / resolution * i
        this.lineTo_mm(context, Vertex(this.props.max_radius * Math.cos(angle),
                                       this.props.max_radius * Math.sin(angle)));
      }
    }
    context.stroke();

    if (this.props.vertices && this.props.vertices.length > 0) {

      // Draw the start and end points
      context.beginPath();
      context.lineWidth = 1.0;
      context.strokeStyle = "green";
      this.dot_mm(context, this.props.vertices[0]);
      context.stroke();
      context.beginPath();
      context.lineWidth = 1.0;
      context.strokeStyle = "red";
      this.dot_mm(context, this.props.vertices[this.props.vertices.length-1]);
      context.stroke();

      // Draw the vertices
      context.beginPath();
      context.lineWidth = this.mmToPixelsScale();
      context.strokeStyle = "yellow";
      this.moveTo_mm(context, this.props.vertices[0]);
      for (var i=0; i<this.props.vertices.length; i++) {
        this.lineTo_mm(context, this.props.vertices[i]);
      }
      context.stroke();
    }
    // Draw the trackVertices
    if (this.props.trackVertices && this.props.trackVertices.length > 0) {
      // Draw the track vertices
      context.beginPath();
      context.lineWidth = this.mmToPixelsScale();
      context.strokeStyle = "green";
      this.moveTo_mm(context, this.props.trackVertices[0]);
      for (i=0; i<this.props.trackVertices.length; i++) {
        this.lineTo_mm(context, this.props.trackVertices[i]);
      }
      context.stroke();
    }

    context.restore();
  }

  resize(canvas, bigBox) {
    var size = parseInt(getComputedStyle(bigBox).getPropertyValue('width'),10);
    canvas.width = size;
    canvas.height = size;
    if (this.props.canvas_width !== size) {
      this.props.onResize(size);
    }
    var context = canvas.getContext('2d');
    this.paint(context)
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
PreviewWindow = connect(mapStateToProps, mapDispatchToProps)(PreviewWindow);

class MachinePreview extends Component {
  render() {
    return (
      <div className="machine-preview">
        <Panel>
            <PreviewWindow />
            <div className="cheatBox" id="biggerBox">
                <MachineSettings />
            </div>
        </Panel>
      </div>
    )
  }
}

export default MachinePreview;

