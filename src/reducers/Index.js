
import enforceLimits from '../LimitEnforcer';
import { Vertex } from '../Geometry.js'

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
  numLoops: 10,
  spinEnabled: false,
  spinValue: 2,
  growEnabled: false,
  growValue: 100,

  turtleVertices: [],

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

const transform = (state, vertex, loop_index) => {
  var transformed_vertex = vertex
  if (state.spinEnabled)
  {
    transformed_vertex = rotate(transformed_vertex, state.spinValue * loop_index);
  }
  if (state.growEnabled)
  {
    transformed_vertex = scale(transformed_vertex, 100.0 + (state.growValue * loop_index));
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
    input = shape.vertices.map( (vertex) => {
      return scale(vertex, 100.0 * state.startingSize);
    });
  }

  var num_loops = state.numLoops;
  var outputVertices = []
  for (var i=0; i<num_loops; i++) {
    for (var j=0; j<input.length; j++) {
      outputVertices.push(transform(state, input[j], i))
    }
  }
  setVerticesHelper(state, outputVertices);
  return state;
};

const computeInput = (state) => {
  if (state.input === 0) {
    return transformShapes(state);
  } else {
    let newState = {
      ...state,
    }
    setVerticesHelper(newState, state.turtleVertices);
    return Object.assign({}, state, {
      vertices: newState.vertices
    });
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

    // Machine Settings
    case 'SET_MIN_X':
      return {...state,
        min_x: action.value,
      };
    case 'SET_MAX_X':
      return {...state,
        max_x: action.value,
      };
    case 'SET_MIN_Y':
      return {...state,
        min_y: action.value,
      };
    case 'SET_MAX_Y':
      return {...state,
        max_y: action.value,
      };

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
