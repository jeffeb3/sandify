
import enforceLimits from '../LimitEnforcer';
import {
  degToRad,
  Vertex,
} from '../Geometry.js'
import Victor from 'victor';

// Transform actions
export const addShape = ( shape ) => {
  return {
    type: 'ADD_SHAPE',
    shape: shape,
  };
}

export const setShape = ( shape ) => {
  return {
    type: 'SET_SHAPE',
    value: shape,
  };
}

export const setShapeSize = ( size ) => {
  return {
    type: 'SET_SHAPE_SIZE',
    value: size,
  };
}

export const setShapeOffset = ( offset ) => {
  return {
    type: 'SET_SHAPE_OFFSET',
    value: parseFloat(offset),
  };
}

export const setLoops = ( loops ) => {
  return {
    type: 'SET_LOOPS',
    value: loops,
  };
}

export const toggleSpin = ( ) => {
  return {
    type: 'TOGGLE_SPIN',
  };
}

export const setSpin = ( value ) => {
  return {
    type: 'SET_SPIN',
    value: value,
  };
}

export const toggleGrow = ( ) => {
  return {
    type: 'TOGGLE_GROW',
  };
}

export const setGrow = ( value ) => {
  return {
    type: 'SET_GROW',
    value: value,
  };
}

// Wipe actions
export const setWiperAngleDeg = ( value ) => {
  return {
    type: 'SET_WIPER_ANGLE_DEG',
    value: value,
  };
}

export const setWiperSize = ( value ) => {
  return {
    type: 'SET_WIPER_SIZE',
    value: value,
  };
}

// Machine actions
export const setMachineMinX = ( value ) => {
  return {
    type: 'SET_MIN_X',
    value: value,
  };
}

export const setMachineMaxX = ( value ) => {
  return {
    type: 'SET_MAX_X',
    value: value,
  };
}

export const setMachineMinY = ( value ) => {
  return {
    type: 'SET_MIN_Y',
    value: value,
  };
}

export const setMachineMaxY = ( value ) => {
  return {
    type: 'SET_MAX_Y',
    value: value,
  };
}

// GCode Actions
export const setGCodePre = ( text ) => {
  return {
    type: 'SET_GCODE_PRE',
    value: text,
  };
}

export const setGCodePost = ( text ) => {
  return {
    type: 'SET_GCODE_POST',
    value: text,
  };
}

export const toggleGCodeReverse = ( ) => {
  return {
    type: 'TOGGLE_GCODE_REVERSE',
  };
}

export const setShowGCode = ( on ) => {
  return {
    type: 'SET_SHOW_GCODE',
    value: on,
  };
}

// Vertices Actions
export const clearVertices = ( ) => {
  return {
    type: 'CLEAR_VERTICES',
  };
}

export const setTurtleVertices = ( vertices ) => {
  return {
    type: 'SET_TURTLE_VERTICES',
    vertices: vertices,
  };
}

export const addVertex = ( vertex ) => {
  return {
    type: 'ADD_VERTEX',
    value: vertex,
  };
}

export const chooseInput = ( input ) => {
  return {
    type: 'CHOOSE_INPUT',
    value: input,
  };
}

const defaultState = {
  // Transform settings
  shapes: [],
  currentShape: undefined,
  startingSize: 10.0,
  shapeOffset: 0.0,
  numLoops: 10,
  spinEnabled: false,
  spinValue: 2,
  growEnabled: false,
  growValue: 100,

  turtleVertices: [],

  wiperAngleDeg: 15,
  wiperSize: 12,

  // Vertices
  vertices: [],
  input: 0,

  // Machine settings
  min_x: 0,
  max_x: 500,
  min_y: 0,
  max_y: 500,

  // GCode settings
  gcodePre: '',
  gcodePost: '',
  gcodeReverse: false,
  showGCode: false,
}

// Vertex functions
const setVerticesHelper = (state, vertices) => {
  vertices = enforceLimits(vertices,
                           (state.max_x - state.min_x)/2.0,
                           (state.max_y - state.min_y)/2.0
                           );
  state.vertices = vertices;
}

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

function offset (vertex, offset) {
  return {
    x: vertex.x + offset,
    y: vertex.y,
    f: vertex.f,
  }
}

const transform = (state, vertex, loop_index) => {
  var transformed_vertex = vertex
  if (state.growEnabled)
  {
    transformed_vertex = scale(transformed_vertex, 100.0 + (state.growValue * loop_index));
  }
  transformed_vertex = offset(transformed_vertex, state.shapeOffset);
  if (state.spinEnabled)
  {
    transformed_vertex = rotate(transformed_vertex, state.spinValue * loop_index);
  }
  return transformed_vertex;
}

const findShape = (shapes, name) => {
  for (let i=0; i<shapes.length; i++) {
    if (name === shapes[i].name) {
      return shapes[i];
    }
  }
  return null;
}

const transformShapes = (state) => {
  const shape = findShape(state.shapes, state.currentShape);
  var input = []
  if (shape) {
    input = shape.vertices(state).map( (vertex) => {
      return scale(vertex, 100.0 * state.startingSize);
    });
  }

  var num_loops = state.numLoops;
  var outputVertices = []
  for (var i=0; i<num_loops; i++) {
    for (var j=0; j<input.length; j++) {
      let fraction = j/input.length;
      outputVertices.push(transform(state, input[j], i+fraction))
    }
  }
  setVerticesHelper(state, outputVertices);
  return state;
};

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

const wiper = (state) => {

  var outputVertices = []

  // Do the math

  // Get the angle between 0,180
  let angle = (180.0 - state.wiperAngleDeg) % 180.0;
  if (angle < 0.0) {
    angle += 180.0;
  }
  console.log('angle:' + angle);
  angle = degToRad(angle);

  // Start with the defaults for 0,45
  let height = state.max_y - state.min_y;
  let width = state.max_x - state.min_x;
  let startLocation = Victor(-width/2.0, height/2.0)
  let orig_delta_w = Victor(state.wiperSize / Math.cos(angle), 0.0);
  let orig_delta_h = Victor(0.0, -state.wiperSize / Math.sin(angle));

  if (angle > Math.PI/4.0 && angle < 0.75 * Math.PI) {
    // flip the logic of x,y
    console.log('logic flipped angle:' + angle);
    let temp = orig_delta_w.clone();
    orig_delta_w = orig_delta_h.clone();
    orig_delta_h = temp;
  }
  if (angle > Math.PI/2.0) {
    console.log('flipping angle:' + angle);
    startLocation = Victor(-width/2.0, -height/2.0)
    orig_delta_w = orig_delta_w.clone().multiply(Victor(-1.0, -1.0));
    orig_delta_h = orig_delta_h.clone().multiply(Victor(-1.0, -1.0));
    console.log(orig_delta_h);
  }
  let delta_w = orig_delta_w;
  let delta_h = orig_delta_h;
  console.log('dw: ' + delta_w + ' dh: ' + delta_h);
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
      nextWidthPoint = boundPoint(nextHeightPoint, nextWidthPoint, width/2.0, height/2.0);
      delta_w = orig_delta_h;
    }
    outputVertices.push(nextWidthPoint);

    // "down-left"
    nextHeightPoint = nextHeightPoint.clone().add(delta_h);
    if (outOfBounds(nextHeightPoint, width, height)) {
      nextHeightPoint = boundPoint(nextWidthPoint, nextHeightPoint, width/2.0, height/2.0);
      delta_h = orig_delta_w;
    }
    outputVertices.push(nextHeightPoint);

    // "down"
    nextHeightPoint = nextHeightPoint.clone().add(delta_h);
    outputVertices.push(nextHeightPoint);
    if (outOfBounds(nextHeightPoint, width, height)) {
      let corner = boundPoint(nextHeightPoint.clone().subtract(delta_h), nextHeightPoint, width/2.0, height/2.0);
      outputVertices.push(corner);
      nextHeightPoint = boundPoint(nextWidthPoint, nextHeightPoint, width/2.0, height/2.0);
      delta_h = orig_delta_w;
    }

    outputVertices.push(nextHeightPoint);
    if (outOfBounds(nextHeightPoint, width, height)) {
      break;
    }

    // "up-right"
    nextWidthPoint = nextWidthPoint.clone().add(delta_w);
    outputVertices.push(nextWidthPoint);
    if (outOfBounds(nextWidthPoint, width, height)) {
      nextWidthPoint = boundPoint(nextHeightPoint, nextWidthPoint, width/2.0, height/2.0);
      delta_w = orig_delta_h;
    }

    if (outOfBounds(nextWidthPoint, width, height)) {
      break;
    }
  }

  console.log(outputVertices);
  setVerticesHelper(state, outputVertices);

  return state;
};

const computeInput = (state) => {
  if (state.input === 0) {
    return transformShapes(state);
  } else if (state.input === 1) {
    let newState = {
      ...state,
    }
    setVerticesHelper(newState, state.turtleVertices);
    return Object.assign({}, state, {
      vertices: newState.vertices
    });
  } else if (state.input === 2) {
    return wiper(state);
  }
}

const reducer  = (state = defaultState, action) => {
  switch (action.type) {

    // Transform actions
    case 'ADD_SHAPE':
      return computeInput({...state,
        shapes: [
          ...state.shapes,
          action.shape
        ],
      });

    case 'SET_SHAPE':
      return computeInput({...state,
        currentShape: action.value,
      });

    case 'SET_SHAPE_SIZE':
      return computeInput({...state,
        startingSize: action.value,
      });

    case 'SET_SHAPE_OFFSET':
      return computeInput({...state,
        shapeOffset: action.value,
      });

    case 'SET_LOOPS':
      return computeInput({...state,
        numLoops: action.value,
      });

    case 'TOGGLE_SPIN':
      return computeInput({...state,
        spinEnabled: !state.spinEnabled,
      });

    case 'TOGGLE_GROW':
      return computeInput({...state,
        growEnabled: !state.growEnabled,
      });

    case 'SET_SPIN':
      return computeInput({...state,
        spinValue: action.value,
      });

    case 'SET_GROW':
      return computeInput({...state,
        growValue: action.value,
      });

    // Vertex actions
    case 'CLEAR_VERTICES':
      return Object.assign({}, state, {
        vertices: [],
      });
    case 'SET_TURTLE_VERTICES':
      return computeInput({...state,
        turtleVertices: action.vertices,
      });
    case 'ADD_VERTEX': {
      let newState = {
        ...state,
      }
      setVerticesHelper(newState, [
          ...state.vertices,
          action.value,
        ]);
      return Object.assign({}, state, {
        vertices: newState.vertices
      });
    }
    case 'CHOOSE_INPUT':
      return computeInput({...state,
        input: action.value,
      });

    // Wiper Settings
    case 'SET_WIPER_ANGLE_DEG':
      return computeInput({...state,
        wiperAngleDeg: action.value,
      });
    case 'SET_WIPER_SIZE':
      return computeInput({...state,
        wiperSize: action.value,
      });

    // Machine Settings
    case 'SET_MIN_X':
      return computeInput({...state,
        min_x: action.value,
      });
    case 'SET_MAX_X':
      return computeInput({...state,
        max_x: action.value,
      });
    case 'SET_MIN_Y':
      return computeInput({...state,
        min_y: action.value,
      });
    case 'SET_MAX_Y':
      return computeInput({...state,
        max_y: action.value,
      });

    // GCode Settings
    case 'SET_GCODE_PRE':
      return {...state,
        gcodePre: action.value,
      };
    case 'SET_GCODE_POST':
      return {...state,
        gcodePost: action.value,
      };
    case 'TOGGLE_GCODE_REVERSE':
      return computeInput({...state,
        gcodeReverse: !state.gcodeReverse,
      });
    case 'SET_SHOW_GCODE':
      return {...state,
        showGCode: action.value,
      };

    case '@@redux/INIT':
      return state;

    default:
      console.log('unknown action.type: ' + action.type);
      return state;
  }
};

export default reducer;
