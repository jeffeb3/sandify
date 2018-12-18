import {
  degToRad,
  Vertex,
} from '../Geometry.js'
import {
  enforceRectLimits,
  enforcePolarLimits
} from '../machine/LimitEnforcer';
import Victor from 'victor';

// Transform funtions
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
  let angle = data.trackLength * loop_index / 16 * 2.0 * Math.PI;
  let radius = 1.0;
  if (data.trackGrowEnabled) {
    radius = 1.0 + loop_index / 10.0 * data.trackGrow / 100.0;
  }
  return {
    x: vertex.x + radius * data.trackValue * Math.cos(angle),
    y: vertex.y + radius * data.trackValue * Math.sin(angle),
    f: vertex.f, // Why do I still have f in here?
  };
}

export const transform = (data, vertex, loop_index) => {
  var transformed_vertex = vertex
  if (data.growEnabled)
  {
    transformed_vertex = scale(transformed_vertex, 100.0 + (data.growValue * loop_index));
  }
  transformed_vertex = offset(transformed_vertex, data.shapeOffsetX, data.shapeOffsetY);
  if (data.spinEnabled)
  {
    transformed_vertex = rotate(transformed_vertex, data.spinValue * loop_index);
  }
  if (data.trackEnabled) {
    transformed_vertex = track(transformed_vertex, data, loop_index);
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

const findShape = (shapes, name) => {
  for (let i=0; i<shapes.length; i++) {
    if (name === shapes[i].name) {
      return shapes[i];
    }
  }
  return null;
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
export const setVerticesHelper = (state, vertices) => {
  let machine = state.machine;
  if (vertices.length > 0) {
    if (machine.rectangular && machine.rectOrigin.length === 1) {

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

      while (nextCorner !== machine.rectOrigin[0]) {
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
    if (machine.polarEndpoints && !machine.rectangular) {

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
  if (state.gcodeReverse) {
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
  state.vertices = vertices;
}

const wiper = (state) => {

  var outputVertices = []

  // Do the math

  // Get the angle between 0,180
  let angle = (180.0 - (state.wiperAngleDeg % 360)) % 180.0;
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
  let orig_delta_w = Victor(state.wiperSize / Math.cos(angle), 0.0);
  let orig_delta_h = Victor(0.0, -state.wiperSize / Math.sin(angle));

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

  setVerticesHelper(state, outputVertices);

  return state;
};

const thetaRho = (state) => {
  let machine = state.machine;
  var x_scale = (machine.max_x - machine.min_x)/2.0 * 0.01 * state.thrZoom;
  var y_scale = (machine.max_y - machine.min_y)/2.0 * 0.01 * state.thrZoom;
  if (!machine.rectangular) {
    x_scale = y_scale = machine.max_radius;
  }
  x_scale *= 0.01 * state.thrZoom;
  y_scale *= 0.01 * state.thrZoom;
  if (state.thrAspectRatio) {
    x_scale = y_scale = Math.min(x_scale,y_scale);
  }

  var newVertices = state.thrVertices.map( (vertex) => {
    return {...vertex,
      x: vertex.x * x_scale,
      y: vertex.y * y_scale,
    };
  });
  setVerticesHelper(state, newVertices);
  return state;
}

const transformShapes = (state) => {
  const shape = findShape(state.shapes, state.currentShape);
  var input = []
  if (shape) {
    input = shape.vertices(state).map( (vertex) => {
      return scale(vertex, 100.0 * state.startingSize);
    });
  }

  var num_loops = state.transform.numLoops;
  var outputVertices = []
  for (var i=0; i<num_loops; i++) {
    for (var j=0; j<input.length; j++) {
      let fraction = j/input.length;
      outputVertices.push(transform(state.transform, input[j], i+fraction))
    }
  }
  setVerticesHelper(state, outputVertices);
  return state;
};

export const computeInput = (state) => {
  if (state.input === 0) {
    return transformShapes(state);
  }
  if (state.input === 1) {
    let newState = {
      ...state,
    }
    setVerticesHelper(newState, state.turtleVertices);
    return Object.assign({}, state, {
      vertices: newState.vertices
    });
  } else if (state.input === 2) {
    return wiper(state);
  } else if (state.input === 3) {
    return thetaRho(state);
  }
}


