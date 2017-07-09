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
      ]
    }
  }

  componentDidMount(){
      // For single radials, centre radius is interesting at any value.
      // For loops, it only looks nice with low values for now.
      // Need to implement offset compensation
      var centre_radius = 1;
      // Must be less than 120.  Not sure why
      var spike_height = 110;
      // Has to be 60+
      var curve_radius = 60;
      var n = 10;
      for(var i=0; i<10; i++){
        radial(this, centre_radius,spike_height-(i*10),curve_radius+i,n);
        this.right(10);
      }
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
        Turtles!
      </div>
    );
  }

}

export default Turtle;
