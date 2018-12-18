import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './MachinePreview.css';
import { Vertex } from '../Geometry';
import MachineSettings from './MachineSettings.js';
import { connect } from 'react-redux'
import { Panel } from 'react-bootstrap'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import {
  setMachinePreviewSize,
  setMachineSlider,
} from '../reducers/Index.js';
import {
  transform,
} from '../inputs/Computer.js';
import { createSelector } from 'reselect'

const getTransform = state => state.transform;
const getMachine = state => state.machine;

const getTrackVertices = createSelector(
  [getTransform],
  (data) => {
    var num_loops = data.numLoops;
    var trackVertices = []
    for (var i=0; i<num_loops; i++) {
      if (data.trackEnabled) {
        trackVertices.push(transform(data, {x: 0.0, y: 0.0}, i))
      }
    }
    return trackVertices;
  }
);

const mapStateToProps = (state, ownProps) => {
  return {
    use_rect: state.machine.rectangular,
    min_x: state.machine.min_x,
    max_x: state.machine.max_x,
    min_y: state.machine.min_y,
    max_y: state.machine.max_y,
    max_radius: state.machine.max_radius,
    canvas_width: state.canvas_width,
    canvas_height: state.canvas_height,
    vertices: state.vertices,
    sliderValue: state.machineSlider,
    trackVertices: getTrackVertices(state),
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

  slice_vertices(vertices, sliderValue) {
    const slide_size = 10.0;
    if (sliderValue === 0) {
      return vertices;
    }

    // Let's start by just assuming we want a slide_size sized window, as a percentage of the whole
    // thing.
    //
    const begin_fraction = sliderValue / 100.0;
    const end_fraction = (slide_size + sliderValue) / 100.0;

    const begin_vertex = Math.round(vertices.length * begin_fraction);
    const end_vertex = Math.round(vertices.length * end_fraction);

    return vertices.slice(begin_vertex, end_vertex);
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

    var drawing_vertices = this.props.vertices;

    drawing_vertices = this.slice_vertices(drawing_vertices, this.props.sliderValue);

    if (drawing_vertices && drawing_vertices.length > 0) {

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

      // Draw the background vertices
      if (this.props.sliderValue !== 0) {
        context.beginPath();
        context.lineWidth = this.mmToPixelsScale();
        context.strokeStyle = "gray";
        this.moveTo_mm(context, this.props.vertices[0]);
        for (let i=0; i<this.props.vertices.length; i++) {
          this.lineTo_mm(context, this.props.vertices[i]);
        }
        context.stroke();
      }

      // Draw the specific vertices
      context.beginPath();
      context.lineWidth = this.mmToPixelsScale();
      context.strokeStyle = "yellow";
      this.moveTo_mm(context, drawing_vertices[0]);
      for (let i=0; i<drawing_vertices.length; i++) {
        this.lineTo_mm(context, drawing_vertices[i]);
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
      for (let i=0; i<this.props.trackVertices.length; i++) {
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

const machineStateToProps = (state, ownProps) => {
  return {
    sliderValue: state.machineSlider,
  }
}

const machineDispatchToProps = (dispatch, ownProps) => {
  return {
    onSlider: (value) => {
      dispatch(setMachineSlider(value))
    },
  }
}

class MachinePreview extends Component {
  render() {
    return (
      <div className="machine-preview">

        <Panel>
            <PreviewWindow />
            <div className="slide-box">
                <Slider
                  value={this.props.sliderValue}
                  step={1.0}
                  min={0.0}
                  max={100.0}
                  onChange={this.props.onSlider}
                />
            </div>
            <div className="cheatBox" id="biggerBox">
                <MachineSettings />
            </div>
        </Panel>
      </div>
    )
  }
}
MachinePreview = connect(machineStateToProps, machineDispatchToProps)(MachinePreview);

export default MachinePreview;

