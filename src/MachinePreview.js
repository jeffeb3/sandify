import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './MachinePreview.css';
import {
    Col,
    ControlLabel,
    Form,
    FormControl,
    FormGroup,
} from 'react-bootstrap'
import Vertex from './Geometry';

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
    var y = vertex.y * min_scale + this.props.canvas_height/2.0;

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

  limit(vertex) {
    var machine_x = this.props.max_x - this.props.min_x;
    var machine_y = this.props.max_y - this.props.min_y;
    return Vertex(Math.min(machine_x/2.0, Math.max(-machine_x/2.0, vertex.x)),
                  Math.min(machine_y/2.0, Math.max(-machine_x/2.0, vertex.y)))
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
      this.lineTo_mm(context, this.limit(this.props.vertices[i]));
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

class MachineSettings extends Component {
  render() {
    return (
      <div className="machine-form">
        <Form horizontal>
          <FormGroup controlId="min_x">
            <Col componentClass={ControlLabel} sm={3}>
              Min X (mm)
            </Col>
            <Col sm={8}>
              <FormControl type="number" value={this.props.min_x} onChange={this.props.onMinXChange}/>
            </Col>
          </FormGroup>
          <FormGroup controlId="max_x">
            <Col componentClass={ControlLabel} sm={3}>
              Max X (mm)
            </Col>
            <Col sm={8}>
              <FormControl type="number" value={this.props.max_x} onChange={this.props.onMaxXChange}/>
            </Col>
          </FormGroup>
          <FormGroup controlId="min_y">
            <Col componentClass={ControlLabel} sm={3}>
              Min Y (mm)
            </Col>
            <Col sm={8}>
              <FormControl type="number" value={this.props.min_y} onChange={this.props.onMinYChange}/>
            </Col>
          </FormGroup>
          <FormGroup controlId="max_y">
            <Col componentClass={ControlLabel} sm={3}>
              Max Y (mm)
            </Col>
            <Col sm={8}>
              <FormControl type="number" value={this.props.max_y} onChange={this.props.onMaxYChange}/>
            </Col>
          </FormGroup>
        </Form>
      </div>
    )
  }
}

class MachinePreview extends Component {
  constructor(props) {
    super(props)
    this.state = {
      min_x: 0.0,
      max_x: 500.0,
      min_y: 0.0,
      max_y: 500.0,
    }
    this.onMinXChange = this.onMinXChange.bind(this)
    this.onMaxXChange = this.onMaxXChange.bind(this)
    this.onMinYChange = this.onMinYChange.bind(this)
    this.onMaxYChange = this.onMaxYChange.bind(this)
  }

  onMinXChange(event) {
    this.setState({ min_x: event.target.value })
  }

  onMaxXChange(event) {
    this.setState({ max_x: event.target.value })
  }

  onMinYChange(event) {
    this.setState({ min_y: event.target.value })
  }

  onMaxYChange(event) {
    this.setState({ max_y: event.target.value })
  }

  render() {
    return (
      <div className="machine-preview">
        <MachineSettings
          min_x={this.state.min_x}
          max_x={this.state.max_x}
          min_y={this.state.min_y}
          max_y={this.state.max_y}
          onMinXChange={this.onMinXChange}
          onMaxXChange={this.onMaxXChange}
          onMinYChange={this.onMinYChange}
          onMaxYChange={this.onMaxYChange}
          />
        <PreviewWindow
          min_x={this.state.min_x}
          max_x={this.state.max_x}
          min_y={this.state.min_y}
          max_y={this.state.max_y}
          canvas_width={this.props.canvas_width}
          canvas_height={this.props.canvas_height}
          vertices={this.props.vertices}
        />
      </div>
    )
  }
}

export default MachinePreview;

