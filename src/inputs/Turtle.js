import React, { Component } from 'react';
import {
  radToDeg,
  Vertex,
} from '../Geometry';
import { radial } from './TurtleUtils'
import { connect } from 'react-redux'

import {
  clearVertices,
  setTurtleVertices,
} from '../reducers/Index.js';

import {
  Turtle,
  reset,
  forward,
  angle,
  right,
  left,
} from './PureTurtle.js';


let ReduxTurtle = (addVertex) => {

  let turtle = Turtle();
  let saveVertex = () => {
    addVertex(Vertex(turtle.x, turtle.y));
  }

  return Object.assign(
    {},
    turtle,
    {
      reset: () => {
        reset(turtle);
        saveVertex();
      },
      forward: (distance) => {
        forward(turtle, distance);
        saveVertex();
      },
      angle: (angle_deg) => {
        angle(turtle, angle_deg);
      },
      right: (angle_deg) => {
        right(turtle, angle_deg);
      },
      left: (angle_deg) => {
        left(turtle, angle_deg);
      },
      saveVertex: saveVertex,
    });
}

const spiralProps = (state, ownProps) => {
  return {
  }
}

const spiralDispatch = (dispatch, ownProps) => {
  return {
    clearDrawing: () => {
      dispatch(clearVertices());
    },
    setVertices: (vertices) => {
      dispatch(setTurtleVertices(vertices));
    },
  }
}

class SpiralSettings extends Component {

  constructor(props) {
    super(props);

    this.state = {
      dynamicValues: {
        "spikeHeight": 20,
        "spikeCount": 10,
        "spikeCurveRadius": 60,
        "spikeCentreRadius": 0,
        "radialLoops": 1,
        "scaleFactor": 0,
        "rotateAngle": 0
      }
    }

    // this.vertices is not part of this.state, because it's not needed for drawing, and it's nice
    // to avoid the state. It can be published to the reducer with publishVertices()
    this.vertices = [];

    this.turtle = ReduxTurtle(this.addVertex.bind(this));

    this.handleInputChange = this.handleInputChange.bind(this);
  }

  componentDidMount() {
    this.drawDemo();
  }

  handleInputChange(event) {
    console.log("handleInputChange");
    console.log(event.target.id);

    var dynamicValues = this.state.dynamicValues;

    dynamicValues[event.target.id] = event.target.value;

    this.setState({dynamicValues: dynamicValues});
    this.drawDemo();
  }

  addVertex(vertex) {
    this.vertices.push(vertex);
  }

  drawDemo() {
    this.props.clearDrawing();
    this.vertices = [];
    this.turtle.reset();
    // For single radials, centre radius is interesting at any value.
    // For loops, it only looks nice with low values for now.
    // Need to implement offset compensation

    // Must be less than 120.  Not sure why
    //var spikeHeight = this.spikeHeight;
    var spikeHeight = this.state.dynamicValues["spikeHeight"];
    var spikeCount = this.state.dynamicValues["spikeCount"];
    var spikeCurveRadius = this.state.dynamicValues["spikeCurveRadius"];
    var spikeCentreRadius = this.state.dynamicValues["spikeCentreRadius"];
    var radialLoops = this.state.dynamicValues["radialLoops"];
    var scaleFactor = this.state.dynamicValues["scaleFactor"];
    var rotateAngle = this.state.dynamicValues["rotateAngle"];
    //spikeCurveRadius = 60;
  //  console.log("SH: " + spikeHeight);
    // Has to be 60+
    for(var i=0; i<radialLoops; i++){
      radial(this.turtle,
             spikeCentreRadius,
             spikeHeight-(i*scaleFactor),
             spikeCurveRadius+i,
             spikeCount);
      this.turtle.right(rotateAngle);
    }
    this.props.setVertices(this.vertices);
  }

  render() {
    return(
      <div>
        <h4>Turtle Graphics Demonstration</h4>

        <p>If it all disappears, refresh and try to break it again.  Working on it. :D </p>
        <p>When rotate angle and centre radius are used together, things get chaotic.  There is a bug creating an interesting offset.</p>
        <p>Current angle: {radToDeg(this.turtle.angle_rad)}</p>
        <Slider
          id="spikeHeight"
          sliderLabel="Spike height"
          initialValue={this.state.dynamicValues.spikeHeight}
          minValue="0"
          maxValue="60"
          onChange={this.handleInputChange}
          />
        <Slider
          id="spikeCount"
          sliderLabel="Spike count"
          initialValue={this.state.dynamicValues.spikeCount}
          minValue="3"
          maxValue="40"
          onChange={this.handleInputChange}
          />
        <Slider
          id="spikeCurveRadius"
          sliderLabel="Spike curve radius"
          initialValue={this.state.dynamicValues.spikeCurveRadius}
          minValue="4"
          maxValue="60"
          onChange={this.handleInputChange}
          />
        <Slider
          id="spikeCentreRadius"
          sliderLabel="Spike centre radius"
          initialValue={this.state.dynamicValues.spikeCentreRadius}
          minValue="0"
          maxValue="60"
          onChange={this.handleInputChange}
          />
        <Slider
          id="radialLoops"
          sliderLabel="Radial Loops"
          initialValue={this.state.dynamicValues.radialLoops}
          minValue="1"
          maxValue="15"
          onChange={this.handleInputChange}
          />
        <Slider
          id="scaleFactor"
          sliderLabel="Scale Factor"
          initialValue={this.state.dynamicValues.scaleFactor}
          minValue="-10"
          maxValue="10"
          onChange={this.handleInputChange}
          />
        <Slider
          id="rotateAngle"
          sliderLabel="Rotate Angle"
          initialValue={this.state.dynamicValues.rotateAngle}
          minValue="0"
          maxValue="300"
          onChange={this.handleInputChange}
          />
      </div>

    );
  }
}
SpiralSettings = connect(spiralProps, spiralDispatch)(SpiralSettings);

class Slider extends Component {
  constructor(props) {
    super(props)
    this.state = {
      rangeValue: this.props.initialValue
    }
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({ rangeValue: event.target.value });
  }

  render() {
    return (
      <div>
        {this.props.sliderLabel}:<input id={this.props.id} value={this.props.initialValue} type="range" min={this.props.minValue} max={this.props.maxValue}   onChange={this.props.onChange}/>
      </div>
    )
  }
}

export default SpiralSettings;
