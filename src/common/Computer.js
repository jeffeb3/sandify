import { createSelector } from 'reselect'
import {
  degToRad,
  Vertex,
} from './Geometry.js'
import {
  enforceRectLimits,
  enforcePolarLimits
} from './LimitEnforcer';
import Victor from 'victor';
import { findShape } from '../features/shapes/registered_shapes.js'

// Transform functions
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

function offset (vertex, offset_x, offset_y) {
  return {
    x: vertex.x + offset_x,
    y: vertex.y + offset_y,
    f: vertex.f,
  }
}

function track (vertex, data, loop_index) {
  let angle = data.track_length * loop_index / 16 * 2.0 * Math.PI;
  let radius = 1.0;
  if (data.track_grow_enabled) {
    radius = 1.0 + loop_index / 10.0 * data.track_grow / 100.0;
  }
  return {
    x: vertex.x + radius * data.track_value * Math.cos(angle),
    y: vertex.y + radius * data.track_value * Math.sin(angle),
    f: vertex.f, // Why do I still have f in here?
  };
}

export const transform = (data, vertex, fraction_index) => {
  var transformed_vertex = vertex
  if (data.grow_enabled)
  {
    transformed_vertex = scale(transformed_vertex, 100.0 + (data.grow_value * fraction_index));
  }
  transformed_vertex = offset(transformed_vertex, data.offset_x, data.offset_y);
  if (data.spin_enabled)
  {
    var loop_period = data.num_loops / (parseInt(data.spin_switchbacks) + 1);
    var stage = fraction_index/loop_period;
    var direction = (stage % 2 < 1 ? 1.0 : -1.0);
    var spin_amount = direction * (fraction_index % loop_period) * data.spin_value;
    // Add in the amount it goes positive to the negatives, so they start at the same place.
    if (direction < 0.0) {
      spin_amount += loop_period * data.spin_value;
    }
    transformed_vertex = rotate(transformed_vertex, spin_amount);
  }
  if (data.track_enabled) {
    transformed_vertex = track(transformed_vertex, data, fraction_index);
  }
  return transformed_vertex;
}

const outOfBounds = (point, width, height) => {
  if (point.x < -width/2.0) {
    return true;
  }
  if (point.y < -height/2.0) {
    return true;
  }
  if (point.x > width/2.0) {
    return true;
  }
  if (point.y > height/2.0) {
    return true;
  }
  return false;
}

// Intersect the line with the boundary, and return the point exactly on the boundary.
// This will keep the shape. i.e. It will follow the line segment, and return the point on that line
// segment.
function boundPoint(good, bad, size_x, size_y) {
  var dx = good.x - bad.x;
  var dy = good.y - bad.y;

  var fixed = Victor(bad.x, bad.y);
  var distance = 0;
  if (bad.x < -size_x || bad.x > size_x) {
    if (bad.x < -size_x) {
      // we are leaving the left
      fixed.x = -size_x;
    } else {
      // we are leaving the right
      fixed.x = size_x;
    }
    distance = (fixed.x - good.x) / dx;
    fixed.y = good.y + distance * dy;
    // We fixed x, but y might have the same problem, so we'll rerun this, with different points.
    return boundPoint(good, fixed, size_x, size_y);
  }
  if (bad.y < -size_y || bad.y > size_y) {
    if (bad.y < -size_y) {
      // we are leaving the bottom
      fixed.y = -size_y;
    } else {
      // we are leaving the top
      fixed.y = size_y;
    }
    distance = (fixed.y - good.y) / dy;
    fixed.x = good.x + distance * dx;
  }
  return fixed;
}

function nearEnough(end, point) {
  if (point.clone().subtract(end).length() < 0.01) {
    return true;
  }
  return false;
}

// Vertex functions
export const polishVertices = (state, vertices) => {
  let machine = state.machine;
  if (vertices.length > 0) {
    if (machine.rectangular && machine.rect_origin.length === 1) {

      // OK, let's assign corners indices:
      //
      // [1]   [2]
      //
      //
      // [0]   [3]

      let dx = (machine.max_x - machine.min_x) / 2.0;
      let dy = (machine.max_y - machine.min_y) / 2.0;

      let corners = [
        {x: -dx, y: -dy},
        {x: -dx, y:  dy},
        {x:  dx, y:  dy},
        {x:  dx, y: -dy}
      ];
      console.log(corners);

      let first = vertices[0];
      let last = vertices[vertices.length-1];

      // Max radius
      let max_radius = Math.sqrt(Math.pow(2.0*dx,2.0) + Math.pow(2.0*dy, 2.0)) / 2.0;

      let vFirst = Victor.fromObject(first);
      let vLast = Victor.fromObject(last);
      let outPoint;
      let newVertices = [];
      if (vFirst.magnitude() <= vLast.magnitude()) {
        // It's going outward
        let scale = max_radius / vLast.magnitude();
        outPoint = vLast.multiply(Victor(scale,scale));
        newVertices.push({ ...last, x: outPoint.x, y: outPoint.y});
      } else {
        let scale = max_radius / vFirst.magnitude();
        outPoint = vFirst.multiply(Victor(scale,scale));
        newVertices.push({ ...first, x: outPoint.x, y: outPoint.y});
      }
      console.log(outPoint);
      console.log(dx);

      let nextCorner = 1;
      if (outPoint.x >= dx) {
        // right
        nextCorner = 2;
      } else if (outPoint.x <= -dx) {
        // left
        nextCorner = 0;
      } else if (outPoint.y >= dy) {
        // up
        nextCorner = 1;
      } else if (outPoint.y <= -dy) {
        // down
        nextCorner = 3;
      } else {
        console.log("Darn!");
        nextCorner = 3;
      }
      // console.log("nextCorner: " + nextCorner);
      // newVertices.push({ ...first, x: corners[nextCorner].x, y: corners[nextCorner].y});

      while (nextCorner !== machine.rect_origin[0]) {
        console.log("nextCorner: " + nextCorner);
        newVertices.push({ ...first, x: corners[nextCorner].x, y: corners[nextCorner].y});
        nextCorner -= 1;
        if (nextCorner < 0) {
          nextCorner = 3;
        }
      }
      console.log("nextCorner: " + nextCorner);
      newVertices.push({ ...first, x: corners[nextCorner].x, y: corners[nextCorner].y});

      console.log(newVertices);
      if (vFirst.magnitude() <= vLast.magnitude()) {
        // outward
        vertices = vertices.concat(newVertices);
      } else {
        vertices = newVertices.reverse().concat(vertices);
      }
    }
    if (machine.polar_endpoints && !machine.rectangular) {

      let first = vertices[0];
      let last = vertices[vertices.length-1];

      // Always put 0.0 in there

      // Max radius
      let max_radius = machine.max_radius;
      let vFirst = Victor.fromObject(first);
      let vLast = Victor.fromObject(last);
      if (vFirst.magnitude() <= vLast.magnitude()) {
        // It's going outward
        let scale = max_radius / vLast.magnitude();
        let outPoint = vLast.multiply(Victor(scale,scale));
        vertices.unshift(Vertex(0.0, 0.0, first.f));
        vertices.push(Vertex(outPoint.x, outPoint.y, last.f));
      } else {
        let scale = max_radius / vFirst.magnitude();
        let outPoint = vFirst.multiply(Victor(scale,scale));
        vertices.push(Vertex(0.0, 0.0, first.f));
        vertices.unshift(Vertex(outPoint.x, outPoint.y, last.f));
      }
    }
  }

  if (state.gcode.reverse) {
    vertices.reverse();
  }
  if (machine.rectangular) {
    vertices = enforceRectLimits(vertices,
                                 (machine.max_x - machine.min_x)/2.0,
                                 (machine.max_y - machine.min_y)/2.0
                                 );
  } else {
    vertices = enforcePolarLimits(vertices,
                                  machine.max_radius
                                  );
  }

  return vertices;
}

const wiper = (state) => {
  var outputVertices = []

  // Do the math

  // Get the angle between 0,180
  let angle = (180.0 - (state.wiper.angle_deg % 360)) % 180.0;
  if (angle < 0.0) {
    angle += 180.0;
  }
  angle = degToRad(angle);

  // Start with the defaults for 0,45
  let height = 1;
  let width = 1;
  let machine = state.machine;
  if (machine.rectangular) {
    height = machine.max_y - machine.min_y;
    width = machine.max_x - machine.min_x;
  } else {
    height = machine.max_radius * 2.0;
    width = height;
  }

  let startLocation = Victor(-width/2.0, height/2.0)
  let cosa = Math.cos(angle);
  let sina = Math.sin(angle);
  // These can be zero, but infinity isn't great for out math, so let's just clip it.
  if (Math.abs(cosa) < 1.0e-10) {
    cosa = 1.0e-10;
  }
  if (Math.abs(sina) < 1.0e-10) {
    sina = 1.0e-10;
  }
  let orig_delta_w = Victor(state.wiper.size / cosa, 0.0);
  let orig_delta_h = Victor(0.0, -state.wiper.size / sina);

  if (angle > Math.PI/4.0 && angle < 0.75 * Math.PI) {
    // flip the logic of x,y
    let temp = orig_delta_w.clone();
    orig_delta_w = orig_delta_h.clone();
    orig_delta_h = temp;
  }
  if (angle > Math.PI/2.0) {
    startLocation = Victor(-width/2.0, -height/2.0)
    orig_delta_w = orig_delta_w.clone().multiply(Victor(-1.0, -1.0));
    orig_delta_h = orig_delta_h.clone().multiply(Victor(-1.0, -1.0));
  }
  let delta_w = orig_delta_w;
  let delta_h = orig_delta_h;
  let endLocation = startLocation.clone().multiply(Victor(-1.0, -1.0));
  outputVertices.push(startLocation);
  let nextWidthPoint = startLocation;
  let nextHeightPoint = startLocation;

  let emergency_break = 0;
  while (emergency_break < 1000) {
    emergency_break += 1;

    // "right"
    nextWidthPoint = nextWidthPoint.clone().add(delta_w);
    if (outOfBounds(nextWidthPoint, width, height)) {
      let corner = boundPoint(nextWidthPoint.clone().subtract(delta_w), nextWidthPoint, width/2.0, height/2.0);
      outputVertices.push(corner);
      if (nearEnough(endLocation, corner)) {
        break;
      }
      nextWidthPoint = boundPoint(nextHeightPoint, nextWidthPoint, width/2.0, height/2.0);
      delta_w = orig_delta_h;
    }
    outputVertices.push(nextWidthPoint);
    if (nearEnough(endLocation, nextWidthPoint)) {
      break;
    }

    // "down-left"
    nextHeightPoint = nextHeightPoint.clone().add(delta_h);
    if (outOfBounds(nextHeightPoint, width, height)) {
      nextHeightPoint = boundPoint(nextWidthPoint, nextHeightPoint, width/2.0, height/2.0);
      delta_h = orig_delta_w;
    }
    outputVertices.push(nextHeightPoint);
    if (nearEnough(endLocation, nextHeightPoint)) {
      break;
    }

    // "down"
    nextHeightPoint = nextHeightPoint.clone().add(delta_h);
    outputVertices.push(nextHeightPoint);
    if (nearEnough(endLocation, nextHeightPoint)) {
      break;
    }
    if (outOfBounds(nextHeightPoint, width, height)) {
      let corner = boundPoint(nextHeightPoint.clone().subtract(delta_h), nextHeightPoint, width/2.0, height/2.0);
      outputVertices.push(corner);
      if (nearEnough(endLocation, corner)) {
        break;
      }
      nextHeightPoint = boundPoint(nextWidthPoint, nextHeightPoint, width/2.0, height/2.0);
      delta_h = orig_delta_w;
    }
    outputVertices.push(nextHeightPoint);
    if (nearEnough(endLocation, nextHeightPoint)) {
      break;
    }

    // "up-right"
    nextWidthPoint = nextWidthPoint.clone().add(delta_w);
    outputVertices.push(nextWidthPoint);
    if (nearEnough(endLocation, nextWidthPoint)) {
      break;
    }
    if (outOfBounds(nextWidthPoint, width, height)) {
      nextWidthPoint = boundPoint(nextHeightPoint, nextWidthPoint, width/2.0, height/2.0);
      delta_w = orig_delta_h;
    }
  }

  return polishVertices(state, outputVertices);
};

const thetaRho = (state) => {
  let machine = state.machine;
  var x_scale = (machine.max_x - machine.min_x)/2.0 * 0.01 * state.file.zoom;
  var y_scale = (machine.max_y - machine.min_y)/2.0 * 0.01 * state.file.zoom;
  if (!machine.rectangular) {
    x_scale = y_scale = machine.max_radius;
  }
  x_scale *= 0.01 * state.file.zoom;
  y_scale *= 0.01 * state.file.zoom;
  if (state.file.aspect_ratio) {
    x_scale = y_scale = Math.min(x_scale,y_scale);
  }

  var newVertices = state.file.vertices.map( (vertex) => {
    return {...vertex,
      x: vertex.x * x_scale,
      y: vertex.y * y_scale,
    };
  });
  return polishVertices(state, newVertices);
}

const transformShapes = (state) => {
  let shape = findShape(state.shapes.current_shape)
  let shapeInfo = shape.getInfo()
  var input = []

  if (shape) {
    input = shapeInfo.vertices(state).map( (vertex) => {
      return scale(vertex, 100.0 * state.transform.starting_size);
    });
  }

  var num_loops = state.transform.num_loops;
  var outputVertices = []
  for (var i=0; i<num_loops; i++) {
    for (var j=0; j<input.length; j++) {
      let fraction = j/input.length;
      outputVertices.push(transform(state.transform, input[j], i+fraction))
    }
  }

  return polishVertices(state, outputVertices);
};

const getApp = state => state.app;
const getShapes = state => state.shapes;
const getTransform = state => state.transform;
const getFile = state => state.file;
const getGCode = state => state.gcode;
const getWiper = state => state.wiper;
const getMachine = state => state.machine;

export const getVertices = createSelector(
  [
      getApp,
      getShapes,
      getTransform,
      getFile,
      getGCode,
      getWiper,
      getMachine,
  ],
  (app, shapes, transform, file, gcode, wiperState, machine) => {
    let state = {
      app: app,
      shapes: shapes,
      transform: transform,
      file: file,
      gcode: gcode,
      wiper: wiperState,
      machine: machine
    };

    if (state.app.input === 'shapes') {
      return transformShapes(state);
    } else if (state.app.input === 'wiper') {
      return wiper(state);
    } else if (state.app.input === 'code') {
      return thetaRho(state);
    } else {
      return transformShapes(state);
    }
  }
);

export const getVerticesStats = createSelector(
  [
      getVertices
  ],
  (vertices) => {
    let distance = 0.0;
    let previous = null;
    vertices.forEach( (vertex) => {
      if (previous) {
        distance += Math.sqrt(Math.pow(vertex.x - previous.x, 2.0) +
                              Math.pow(vertex.y - previous.y, 2.0));
      }
      previous = vertex;
    });
    return {
      numPoints: vertices.length,
      distance: Math.floor(distance),
    };
  }
);
