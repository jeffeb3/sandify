import {
  degToRad,
  radToDeg,
} from '../Geometry';

// Pure functions from the original turtle language.

// Create a turtle
export const Turtle = () => {
  return {
    x: 0.0,
    y: 0.0,
    angle_rad: 0.0,
  };
}

// Reset the state of the turtle
export const reset = (turtle) => {
  turtle.x = 0.0;
  turtle.y = 0.0;
  turtle.angle_rad = 0.0;
}

// Trace the forward motion of the turtle
export const forward = (turtle, distance) => {
  // calculate the new location of the turtle after doing the forward movement
  turtle.x += distance * Math.sin(turtle.angle_rad);
  turtle.y += distance * Math.cos(turtle.angle_rad);
}

// set the angle of the turtle in degrees
export const angle = (turtle, angle_deg) => {
  turtle.angle_rad = degToRad(angle_deg) % (2.0 * Math.PI);
}

// turn right by an angle in degrees
export const right = (turtle, angle_deg) => {
  return angle(turtle, radToDeg(turtle.angle_rad + degToRad(angle_deg)));
}

// turn left by an angle in degrees
export const left = (turtle, angle_deg) => {
  return right(turtle, -angle_deg);
}

