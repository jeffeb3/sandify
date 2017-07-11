import React, { Component } from 'react';
import {
    Col,
    ControlLabel,
    Form,
    FormControl,
    FormGroup,
    ListGroup,
    ListGroupItem,
    Panel,
} from 'react-bootstrap'
import './Transforms.css'
import Vicious1Vertices from './Vicious1Vertices';
import Vertex from '../Geometry';

class Shape extends Component {
  constructor(props) {
    super(props)
    this.state = {
      size: 10.0
    }
    this.onSizeChange = this.onSizeChange.bind(this);
  }


  clicked() {
    this.props.activeCallback(this.props.name, this.state.size);
  }

  onSizeChange(event) {
    this.setState({size: event.target.value})
    this.props.activeCallback(this.props.name, event.target.value);
  }

  render() {

    var activeClassName = "";
    if (this.props.active) {
      activeClassName = "active";
    }

    return (
      <div className="shape">
        <ListGroupItem header={this.props.name} className={activeClassName} onClick={this.clicked.bind(this)}>{this.props.description}</ListGroupItem>
        <div className="shoptions">
          <Panel className="options-panel" collapsible expanded={this.props.active}>
            <Form horizontal>
              <FormGroup controlId="shape-size">
                <Col componentClass={ControlLabel} sm={4}>
                  Starting Size
                </Col>
                <Col sm={8}>
                  <FormControl type="number" value={this.state.size} onChange={this.onSizeChange}/>
                </Col>
              </FormGroup>
            </Form>
          </Panel>
        </div>
      </div>
    )
  }
}

class ShapeList extends Component {
  constructor(props) {
    super(props)

    var star_points = []
    for (var i=0; i<10; i++) {
      var angle = Math.PI * 2.0 / 10.0 * i
      var star_scale = 1.0
      if (i % 2 === 0) {
        star_scale *= 0.5
      }
      star_points.push(Vertex(star_scale * Math.cos(angle), star_scale * Math.sin(angle)))
    }
    this.state = {
      shapes: [
        {
          name: "Square",
          description: "4 sided shape with equal sides and 90 degree angles",
          active: false,
          vertices: [
            Vertex(-1,-1),
            Vertex( 1,-1),
            Vertex( 1, 1),
            Vertex(-1, 1),
          ],
        },
        {
          name: "Triangle",
          description: "3 sided shape with equal sides and 120 degree angles",
          active: false,
          vertices: [
            Vertex( 1, 0),
            Vertex( -0.5, 0.867),
            Vertex( -0.5, -0.867),
          ],
        },
        {
          name: "Star",
          description: "5 pointed star",
          active: false,
          vertices: star_points,
        },
        {
          name: "Vicious1",
          description: "Logo",
          active: false,
          vertices: Vicious1Vertices(),
        },
      ]
    }
  }

  setShape(name, size) {
    var shapes = this.state.shapes
    for(var i=0; i<shapes.length; i++) {
      shapes[i].active=false;
      if (shapes[i].name === name) {
        shapes[i].active=true;
        var new_vertices = []
        for (var j=0; j<shapes[i].vertices.length; j++) {
          new_vertices.push(scale(shapes[i].vertices[j], size * 100.0 - 100.0))
        }
        this.props.setVertices(new_vertices);
      }
    }
    this.setState({ shapes: shapes })
  }

  render() {

    var self = this;

    var shape_render = this.state.shapes.map(function(shape) {
      return <Shape
            key={shape.name}
            name={shape.name}
            description={shape.description}
            active={shape.active}
            activeCallback={self.setShape.bind(self)}
          />
    });

    return (
      <div className="shapes">
        <ListGroup>
          {shape_render}
        </ListGroup>
      </div>
    )
  }
}

class RotationTransform extends Component {

  render() {
    var activeClassName = "";
    if (this.props.active) {
      activeClassName = "active";
    }

    return (
      <div className="rotate">
        <ListGroupItem header="Spin" className={activeClassName} onClick={this.props.activeCallback}>Spins the input shape a little bit for each copy</ListGroupItem>
        <div className="rotate-options">
          <Panel className="options-panel" collapsible expanded={this.props.active}>
            <Form horizontal>
              <FormGroup controlId="rotate-step">
                <Col componentClass={ControlLabel} sm={4}>
                  Spin Step
                </Col>
                <Col sm={8}>
                  <FormControl type="number" value={this.props.value} onChange={this.props.onChange}/>
                </Col>
              </FormGroup>
            </Form>
          </Panel>
        </div>
      </div>
    )
  }
}

class ScaleTransform extends Component {
  constructor(props) {
    super(props)
    this.state = {
      scale: 1.0,
    }
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({ scale: event.target.value });
  }

  render() {
    var activeClassName = "";
    if (this.props.active) {
      activeClassName = "active";
    }

    return (
      <div className="scale">
        <ListGroupItem header="Grow" className={activeClassName} onClick={this.props.activeCallback}>Grows or shrinks the input shape a little bit for each copy</ListGroupItem>
        <div className="scale-options">
          <Panel className="options-panel" collapsible expanded={this.props.active}>
            <Form horizontal>
              <FormGroup controlId="scale-step">
                <Col componentClass={ControlLabel} sm={4}>
                  Grow Step
                </Col>
                <Col sm={8}>
                  <FormControl type="number" value={this.props.value} onChange={this.props.onChange}/>
                </Col>
              </FormGroup>
            </Form>
          </Panel>
        </div>
      </div>
    )
  }
}

function rotate (vertex, angle_deg) {
  var angle = Math.PI / 180.0 * angle_deg;
  return Vertex(
           vertex.x * Math.cos(angle) - vertex.y * Math.sin(angle),
           vertex.x * Math.sin(angle) + vertex.y * Math.cos(angle),
           vertex.f);
}

function scale (vertex, scale_perc) {
  var scale = scale_perc / 100.0;
  return {
    x: vertex.x * scale,
    y: vertex.y * scale,
    f: vertex.f,
  }
}

class Transforms extends Component {
  constructor(props) {
    super(props)
    this.state = {
      scaleValue: 100.0,
      rotateValue: 2.0,
      loops: 10,
    }

    // Some non-drawing members
    this.inputVertices = []
    // Aaargh, setState is asynchronous, so it's not necessary done when I call calculate, so this
    // isn't being called with the most recent versions of rotateActive or scaleActive.
    // So I'm duplicating the state here...
    this.rotateActive = false;
    this.rotateValue = 2.0;
    this.scaleActive = false;
    this.scaleValue = 100.0;
    this.loops = 10

    // bind things
    this.setVertices = this.setVertices.bind(this);
    this.clickRotate = this.clickRotate.bind(this);
    this.rotateChanged = this.rotateChanged.bind(this);
    this.clickScale = this.clickScale.bind(this);
    this.scaleChanged = this.scaleChanged.bind(this);
    this.changeLoops = this.changeLoops.bind(this);
    this.calculate = this.calculate.bind(this);
  }

  setVertices(vertices) {
    this.inputVertices = vertices;
    this.calculate()
  }

  clickRotate() {
    this.rotateActive = !this.rotateActive;
    this.setState({ rotateActive: this.rotateActive });
    this.calculate()
  }

  rotateChanged(event) {
    this.rotateValue = event.target.value;
    this.setState({rotateValue: event.target.value});
    this.calculate()
  }

  clickScale() {
    this.scaleActive = !this.scaleActive;
    this.setState({ scaleActive: this.scaleActive });
    this.calculate()
  }

  scaleChanged(event) {
    this.scaleValue = event.target.value;
    this.setState({scaleValue: event.target.value});
    this.calculate()
  }

  changeLoops(event) {
    this.loops = event.target.value;
    this.setState({loops: event.target.value});
    this.calculate()
  }

  transform(vertex, loop_index) {
    var transformed_vertex = vertex
    if (this.rotateActive)
    {
      transformed_vertex = rotate(transformed_vertex, this.rotateValue* loop_index);
    }
    if (this.scaleActive)
    {
      transformed_vertex = scale(transformed_vertex, 100.0 + (this.scaleValue * loop_index));
    }
    return transformed_vertex;
  }

  // Do the actual work for calculating the path
  //
  calculate() {
    var input = this.inputVertices;
    var num_loops = this.loops;
    var outputVertices = []
    for (var i=0; i<num_loops; i++) {
      for (var j=0; j<input.length; j++) {
        outputVertices.push(this.transform(input[j], i))
      }
    }
    this.setState({outputVertices: outputVertices});
    this.props.setVertices(outputVertices);
  }

  render() {

    return (
      <div className="transforms">
        <Panel className="shapes-panel">
          <h4>Input Shapes</h4>
          <ShapeList setVertices={this.setVertices}/>
        </Panel>
        <Panel className="transforms-panel">
          <h4>Modifiers</h4>
          <Form horizontal>
            <FormGroup controlId="loop-count">
              <Col componentClass={ControlLabel} sm={4}>
                Num Loops
              </Col>
              <Col sm={8}>
                <FormControl type="number" value={this.state.loops} onChange={this.changeLoops}/>
              </Col>
            </FormGroup>
          </Form>
          <ListGroup>
            <RotationTransform
              active={this.rotateActive}
              activeCallback={this.clickRotate}
              value={this.rotateValue}
              onChange={this.rotateChanged}
              />
            <ScaleTransform
              active={this.scaleActive}
              activeCallback={this.clickScale}
              value={this.state.scaleValue}
              onChange={this.scaleChanged}
              />
          </ListGroup>
        </Panel>
      </div>
    );
  }
}

export default Transforms

