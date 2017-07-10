import React, { Component } from 'react';
import Vertex from '../Geometry';
import { square, curve, arc, spike, radial } from './TurtleUtils'

function turtleRight(deltaAngle){
  return (previousState, currentProps) => {
    var turtleAngle = previousState.turtleAngle;
    turtleAngle += deltaAngle / 180 * Math.PI;
    return { ...previousState, turtleAngle: turtleAngle };
  };
}

function addVertex(vertex){
  return (previousState, currentProps) => {
    var outputVertices = previousState.outputVertices;
    outputVertices.push(vertex);
    return { ...previousState, outputVertices: outputVertices};
  };
}

class Turtle extends Component {

  constructor() {
    super();

    this.state = {
      turtlePos:  {
        x: 0,
        y: 0
      },
      turtleAngle: 0,
      outputVertices: [
        Vertex(0.0, 0.0),
        Vertex(1.0, 1.0)
      ],
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

    this.handleInputChange = this.handleInputChange.bind(this);
  }

  componentDidMount(){
    this.drawDemo();
  }

  drawDemo(){
    this.clearDrawing();
    // For single radials, centre radius is interesting at any value.
    // For loops, it only looks nice with low values for now.
    // Need to implement offset compensation

    var centreRadius = 1;
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
      radial(this, spikeCentreRadius,spikeHeight-(i*scaleFactor),spikeCurveRadius+i,spikeCount);
      this.right(rotateAngle);
    }

  }

  clearDrawing(){
    var outputVertices = [
      Vertex(0.0, 0.0),
      Vertex(1.0, 1.0)
    ];
    this.state.outputVertices = outputVertices;
    this.state.turtleAngle = 0;
    this.props.setVertices(this.state.outputVertices);
  }

  handleInputChange(event) {
    console.log("handleInputChange");
    console.log(event.target.id);

    var dynamicValues = this.state.dynamicValues;

    dynamicValues[event.target.id] = event.target.value;

    this.setState({dynamicValues: dynamicValues});
    this.drawDemo();
  }
  // Trace the forward motion of the turtle
  forward(distance) {

     var x = this.state.turtlePos.x;
     var y = this.state.turtlePos.y;

    // calculate the new location of the turtle after doing the forward movement
    var cosAngle = Math.cos(this.state.turtleAngle);
    var sinAngle = Math.sin(this.state.turtleAngle);
    var newX = x + sinAngle  * distance;
    var newY = y + cosAngle * distance;

    var turtlePos = this.state.turtlePos;

    turtlePos.x = newX;
    turtlePos.y = newY;

    this.setState({turtlePos: turtlePos});

    // This is a pattern described here:
    // https://medium.com/@wereHamster/beware-react-setstate-is-asynchronous-ce87ef1a9cf3
    // Works for forward() in conjunction with incorrect direct state mutation by the angle
    // functions
    this.setState(addVertex(Vertex(newX,newY)));

    //var stateVertices = this.state.outputVertices;
    //stateVertices.push(Vertex(newX,newY));
    //this.state.outputVertices = stateVertices;
    //this.setState({outputVertices: stateVertices});
    this.props.setVertices(this.state.outputVertices);
  }

  // turn right by an angle in degrees
  right(angle) {

    // This is a pattern described here:
    // https://medium.com/@wereHamster/beware-react-setstate-is-asynchronous-ce87ef1a9cf3
    // Supposed to get around asynchronous state setting issues, but not solving the issues for angle changes.
    // Possibly because forward method accesses state synchronously

    //this.setState(turtleRight(angle));

    var stateAngle = this.state.turtleAngle;
    stateAngle += this.degToRad(angle);
    stateAngle = stateAngle % (2 * Math.PI);

    // This is the standard right way, but it doesn't work with
    // the way the turtle calls are happening here.  Wait for Redux refit?

    //this.setState({turtleAngle: stateAngle});

    // Wrong way, but working for now
    this.state.turtleAngle = stateAngle;
  }

  // turn left by an angle in degrees
  left(angle) {
    var stateAngle = this.state.turtleAngle;
    stateAngle -= this.degToRad(angle);

    // Wrong.  See right().  That is wrong, but explains how it should be right.
    this.state.turtleAngle = stateAngle;

    // Right.  See this is still left() to do.  Whichever way you turn, its wrong.
    // this.setState({turtleAngle: stateAngle});
  }

  // set the angle of the turtle in degrees
  angle(angle) {
    // Wrong
    this.state.turtleAngle = angle;
    // Right, but broken
    //this.setState({turtleAngle: angle});
  }

  // convert degrees to radians
  degToRad(deg) {
     return deg / 180 * Math.PI;
  }

  // convert radians to degrees
  radToDeg(deg) {
     return deg * 180 / Math.PI;
  }

  // Generate a random integer between low and hi
  random(low, hi) {
     return Math.floor(Math.random() * (hi - low + 1) + low);
  }

  repeat(_self, n, action) {
     for(var count = 1; count <= n; count++)
        action(_self);
  }


  render() {
    return(
      <div>
        <h4>Turtle Graphics Demonstration</h4>

        <p>If it all disappears, refresh and try to break it again.  Working on it. :D </p>
        <p>When rotate angle and centre radius are used together, things get chaotic.  There is a bug creating an interesting offset.</p>
        <p>Current angle: {this.radToDeg(this.state.turtleAngle)}</p>
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

export default Turtle;
