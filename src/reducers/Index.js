import {
  computeInput,
} from '../inputs/Computer.js';

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

export const setShapePolygonSides = ( sides ) => {
  return {
    type: 'SET_SHAPE_POLYGON_SIDES',
    value: sides,
  };
}

export const setShapeStarPoints = ( sides ) => {
  return {
    type: 'SET_SHAPE_STAR_POINTS',
    value: sides,
  };
}

export const setShapeStarRatio = ( value ) => {
  return {
    type: 'SET_SHAPE_STAR_RATIO',
    value: Math.min(Math.max(value, 0.0), 1.0),
  };
}

export const setShapeCircleLobes = ( sides ) => {
  return {
    type: 'SET_SHAPE_CIRCLE_LOBES',
    value: sides,
  };
}

export const setShapeSize = ( size ) => {
  return {
    type: 'SET_SHAPE_SIZE',
    value: size,
  };
}

export const setShapeOffsetX = ( offset ) => {
  return {
    type: 'SET_SHAPE_OFFSET_X',
    value: parseFloat(offset),
  };
}

export const setShapeOffsetY = ( offset ) => {
  return {
    type: 'SET_SHAPE_OFFSET_Y',
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

export const toggleTrack = ( ) => {
  return {
    type: 'TOGGLE_TRACK',
  };
}

export const toggleTrackGrow = ( ) => {
  return {
    type: 'TOGGLE_TRACK_GROW',
  };
}

export const setTrack = ( value ) => {
  return {
    type: 'SET_TRACK',
    value: value,
  };
}

export const setTrackLength = ( value ) => {
  return {
    type: 'SET_TRACK_LENGTH',
    value: value,
  };
}

export const setTrackGrow = ( value ) => {
  return {
    type: 'SET_TRACK_GROW',
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
export const toggleMachineRectExpanded = ( ) => {
  localStorage.setItem('machine_rect_active', 1)
  return {
    type: 'TOGGLE_MACHINE_RECT_EXPANDED',
  };
}

export const toggleMachinePolarExpanded = ( ) => {
  localStorage.setItem('machine_rect_active', 2)
  return {
    type: 'TOGGLE_MACHINE_POLAR_EXPANDED',
  };
}

export const setMachineMinX = ( value ) => {
  // This is definitely a side effect...
  localStorage.setItem('machine_min_x', value)
  return {
    type: 'SET_MIN_X',
    value: value,
  };
}

export const setMachineMaxX = ( value ) => {
  localStorage.setItem('machine_max_x', value)
  return {
    type: 'SET_MAX_X',
    value: value,
  };
}

export const setMachineMinY = ( value ) => {
  localStorage.setItem('machine_min_y', value)
  return {
    type: 'SET_MIN_Y',
    value: value,
  };
}

export const setMachineMaxY = ( value ) => {
  localStorage.setItem('machine_max_y', value)
  return {
    type: 'SET_MAX_Y',
    value: value,
  };
}

export const setMachineRadius = ( value ) => {
  localStorage.setItem('machine_radius', value)
  return {
    type: 'SET_MAX_RADIUS',
    value: value,
  };
}

export const setMachinePreviewSize = ( value ) => {
  return {
    type: 'SET_MACHINE_SIZE',
    value: value,
  };
}

export const setMachineSlider = ( value ) => {
  return {
    type: 'SET_MACHINE_SLIDER',
    value: value,
  };
}

// GCode Actions
export const setGCodeFilename = ( text ) => {
  return {
    type: 'SET_GCODE_FILENAME',
    value: text,
  };
}

export const setGCodePre = ( text ) => {
  localStorage.setItem('gcode_pre', text)
  return {
    type: 'SET_GCODE_PRE',
    value: text,
  };
}

export const setGCodePost = ( text ) => {
  localStorage.setItem('gcode_post', text)
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

export const toggleMachineEndpoints = ( ) => {
  return {
    type: 'TOGGLE_MACHINE_ENDPOINTS',
  };
}

export const setMachineRectOrigin = (value) => {
  return {
    type: 'SET_MACHINE_RECT_ORIGIN',
    value: value,
  };
}

export const setShowGCode = ( on ) => {
  return {
    type: 'SET_SHOW_GCODE',
    value: on,
  };
}

export const setThrVertices = ( vertices ) => {
  return {
    type: 'SET_THR_VERTICES',
    vertices: vertices,
  };
}

export const setThrName = ( value ) => {
  return {
    type: 'SET_THR_NAME',
    value: value,
  };
}

export const setThrComment = ( value ) => {
  return {
    type: 'SET_THR_COMMENT',
    value: value,
  };
}

export const setThrZoom = ( value ) => {
  return {
    type: 'SET_THR_ZOOM',
    value: value,
  };
}

export const toggleThrAspectRatio = ( value ) => {
  return {
    type: 'TOGGLE_THR_ASPECT_RATIO',
    value: value,
  };
}

export const chooseInput = ( input ) => {
  return {
    type: 'CHOOSE_INPUT',
    value: input,
  };
}

const defaultState = {
  sandifyVersion: "0.1.2",
  // Transform settings
  shapes: [],
  currentShape: undefined,
  shapePolygonSides: 4,
  shapeStarPoints: 5,
  shapeStarRatio: 0.5,
  shapeCircleLobes: 1,
  startingSize: 10.0,
  transform: {
    shapeOffsetX: 0.0,
    shapeOffsetY: 0.0,
    numLoops: 10,
    growEnabled: false,
    growValue: 100,
    spinEnabled: false,
    spinValue: 2,
    trackEnabled: false,
    trackGrowEnabled: false,
    trackValue: 10,
    trackLength: 0.2,
    trackGrow: 50.0,
  },

  thrName: "",
  thrComment: [],
  thrVertices: [],
  thrZoom: 100,

  wiperAngleDeg: 15,
  wiperSize: 12,

  // Vertices
  vertices: [],
  input: 0,

  // Machine settings
  machine: {
    rectangular: undefined !== localStorage.getItem('machine_rect_active') ? localStorage.getItem('machine_rect_active') < 2 : true,
    min_x: parseFloat(localStorage.getItem('machine_min_x') ? localStorage.getItem('machine_min_x') : 0),
    max_x: parseFloat(localStorage.getItem('machine_max_x') ? localStorage.getItem('machine_max_x') : 500),
    min_y: parseFloat(localStorage.getItem('machine_min_y') ? localStorage.getItem('machine_min_y') : 0),
    max_y: parseFloat(localStorage.getItem('machine_max_y') ? localStorage.getItem('machine_max_y') : 500),
    max_radius: localStorage.getItem('machine_radius') ? localStorage.getItem('machine_radius') : 250,
    rectOrigin: [],
    polarEndpoints: false,
  },

  canvas_width: 600,
  canvas_height: 600,
  machineSlider: 0.0,
  machineRectExpanded: false,
  machinePolarExpanded: false,

  // GCode settings
  filename: "sandify",
  gcodeSettings: [],
  gcodePre: localStorage.getItem('gcode_pre') ? localStorage.getItem('gcode_pre') : '',
  gcodePost: localStorage.getItem('gcode_post') ? localStorage.getItem('gcode_post') : '',
  gcodeReverse: false,
  showGCode: false,
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

    case 'SET_SHAPE_POLYGON_SIDES':
      return computeInput({...state,
        shapePolygonSides: action.value,
      });

    case 'SET_SHAPE_STAR_POINTS':
      return computeInput({...state,
        shapeStarPoints: action.value,
      });

    case 'SET_SHAPE_STAR_RATIO':
      return computeInput({...state,
        shapeStarRatio: action.value,
      });

    case 'SET_SHAPE_CIRCLE_LOBES':
      return computeInput({...state,
        shapeCircleLobes: action.value,
      });

    case 'SET_SHAPE_SIZE':
      return computeInput({...state,
        startingSize: action.value,
      });

    case 'SET_SHAPE_OFFSET_X':
      return computeInput({...state,
        transform: {...state.transform,
          shapeOffsetX: action.value,
        },
      });

    case 'SET_SHAPE_OFFSET_Y':
      return computeInput({...state,
        transform: {...state.transform,
          shapeOffsetY: action.value,
        },
      });

    case 'SET_LOOPS':
      return computeInput({...state,
        transform: {...state.transform,
          numLoops: action.value,
        },
      });

    case 'TOGGLE_SPIN':
      return computeInput({...state,
        transform: {...state.transform,
          spinEnabled: !state.transform.spinEnabled,
        },
      });

    case 'TOGGLE_GROW':
      return computeInput({...state,
        transform: {...state.transform,
          growEnabled: !state.transform.growEnabled,
        },
      });

    case 'TOGGLE_TRACK':
      return computeInput({...state,
        transform: {...state.transform,
          trackEnabled: !state.transform.trackEnabled,
        },
      });

    case 'TOGGLE_TRACK_GROW':
      return computeInput({...state,
        transform: {...state.transform,
          trackGrowEnabled: !state.transform.trackGrowEnabled,
        },
      });

    case 'SET_SPIN':
      return computeInput({...state,
        transform: {...state.transform,
          spinValue: action.value,
        },
      });

    case 'SET_GROW':
      return computeInput({...state,
        transform: {...state.transform,
          growValue: action.value,
        },
      });

    case 'SET_TRACK':
      return computeInput({...state,
        transform: {...state.transform,
          trackValue: action.value,
        },
      });

    case 'SET_TRACK_LENGTH':
      return computeInput({...state,
        transform: {...state.transform,
          trackLength: action.value,
        },
      });

    case 'SET_TRACK_GROW':
      return computeInput({...state,
        transform: {...state.transform,
          trackGrow: action.value,
        },
      });

    // Vertex actions
    case 'SET_THR_VERTICES':
      return computeInput({...state,
        thrVertices: action.vertices,
      });
    case 'SET_THR_NAME':
      return computeInput({...state,
        thrName: action.value,
      });
    case 'SET_THR_COMMENT':
      return computeInput({...state,
        thrComment: action.value,
      });
    case 'SET_THR_ZOOM':
      return computeInput({...state,
        thrZoom: action.value,
      });
    case 'TOGGLE_THR_ASPECT_RATIO':
      return computeInput({...state,
        thrAspectRatio: !state.thrAspectRatio,
      });
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
    case 'TOGGLE_MACHINE_RECT_EXPANDED':
      return computeInput({...state,
        machine: {...state.machine,
          rectangular: true,
        },
        machineRectExpanded: !state.machineRectExpanded,
        machinePolarExpanded: false,
      });

    case 'TOGGLE_MACHINE_POLAR_EXPANDED':
      return computeInput({...state,
        machine: {...state.machine,
          rectangular: false,
        },
        machinePolarExpanded: !state.machinePolarExpanded,
        machineRectExpanded: false,
      });

    case 'SET_MIN_X':
      return computeInput({...state,
        machine: {...state.machine,
          min_x: action.value,
        },
      });
    case 'SET_MAX_X':
      return computeInput({...state,
        machine: {...state.machine,
          max_x: action.value,
        },
      });
    case 'SET_MIN_Y':
      return computeInput({...state,
        machine: {...state.machine,
          min_y: action.value,
        },
      });
    case 'SET_MAX_Y':
      return computeInput({...state,
        machine: {...state.machine,
          max_y: action.value,
        },
      });
    case 'SET_MAX_RADIUS':
      return computeInput({...state,
        machine: {...state.machine,
          max_radius: action.value,
        },
      });
    case 'SET_MACHINE_RECT_ORIGIN':
      let newValue = [];
      for (let i = 0; i < action.value.length ; i++) {
        if (!state.machine.rectOrigin.includes(action.value[i])) {
          newValue.push(action.value[i]);
          break;
        }
      }

      return computeInput({...state,
        machine: {...state.machine,
          rectOrigin: newValue,
        },
      });
    case 'TOGGLE_MACHINE_ENDPOINTS':
      return computeInput({...state,
        machine: {...state.machine,
          polarEndpoints: !state.polarEndpoints,
        },
      });
    case 'SET_MACHINE_SIZE':
      return computeInput({...state,
        canvas_width: action.value,
        canvas_height: action.value,
      });
    case 'SET_MACHINE_SLIDER':
      return computeInput({...state,
        machineSlider: action.value,
      });


    // GCode Settings
    case 'SET_GCODE_FILENAME':
      return {...state,
        filename: action.value,
      };
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
