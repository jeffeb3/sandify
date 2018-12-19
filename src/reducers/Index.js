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

export const setXFormOffsetX = ( offset ) => {
  return {
    type: 'SET_SHAPE_OFFSET_X',
    value: parseFloat(offset),
  };
}

export const setXFormOffsetY = ( offset ) => {
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

export const toggleReverse = ( ) => {
  return {
    type: 'TOGGLE_REVERSE',
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

export const setFileVertices = ( vertices ) => {
  return {
    type: 'SET_FILE_VERTICES',
    vertices: vertices,
  };
}

export const setFileName = ( value ) => {
  return {
    type: 'SET_FILE_NAME',
    value: value,
  };
}

export const setFileComment = ( value ) => {
  return {
    type: 'SET_FILE_COMMENT',
    value: value,
  };
}

export const setFileZoom = ( value ) => {
  return {
    type: 'SET_FILE_ZOOM',
    value: value,
  };
}

export const toggleFileAspectRatio = ( value ) => {
  return {
    type: 'TOGGLE_FILE_ASPECT_RATIO',
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
  app: {
    sandifyVersion: "0.1.2",
    input: 0,
    reverse: false,
    canvas_width: 600,
    canvas_height: 600,
    machineSlider: 0.0,
    machineRectExpanded: false,
    machinePolarExpanded: false,
    showGCode: false,
  },

  // Transform settings
  shapes: {
    shapes: [],
    currentShape: undefined,
    polygonSides: 4,
    starPoints: 5,
    starRatio: 0.5,
    circleLobes: 1,
    startingSize: 10.0,
  },

  transform: {
    xformOffsetX: 0.0,
    xformOffsetY: 0.0,
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

  file: {
    name: "",
    comments: [],
    vertices: [],
    zoom: 100,
    aspectRatio: false,
  },

  wiper: {
    angleDeg: 15,
    size: 12,
  },

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

  // GCode settings
  gcode: {
    filename: "sandify",
    pre: localStorage.getItem('gcode_pre') ? localStorage.getItem('gcode_pre') : '',
    post: localStorage.getItem('gcode_post') ? localStorage.getItem('gcode_post') : '',
  },
}

const reducer  = (state = defaultState, action) => {
  switch (action.type) {

    // shape actions
    case 'ADD_SHAPE':
      return {...state,
        shapes: {...state.shapes,
          shapes: [...state.shapes.shapes,
            action.shape
          ],
        },
      };

    case 'SET_SHAPE':
      return {...state,
        shapes: {...state.shapes,
          currentShape: action.value,
        },
      };

    case 'SET_SHAPE_POLYGON_SIDES':
      return {...state,
        shapes: {...state.shapes,
          polygonSides: action.value,
        },
      };

    case 'SET_SHAPE_STAR_POINTS':
      return {...state,
        shapes: {...state.shapes,
          starPoints: action.value,
        },
      };

    case 'SET_SHAPE_STAR_RATIO':
      return {...state,
        shapes: {...state.shapes,
          starRatio: action.value,
        },
      };

    case 'SET_SHAPE_CIRCLE_LOBES':
      return {...state,
        shapes: {...state.shapes,
          circleLobes: action.value,
        },
      };

    case 'SET_SHAPE_SIZE':
      return {...state,
        shapes: {...state.shapes,
          startingSize: action.value,
        },
      };

    case 'SET_SHAPE_OFFSET_X':
      return {...state,
        transform: {...state.transform,
          xformOffsetX: action.value,
        },
      };

    case 'SET_SHAPE_OFFSET_Y':
      return {...state,
        transform: {...state.transform,
          xformOffsetY: action.value,
        },
      };

    case 'SET_LOOPS':
      return {...state,
        transform: {...state.transform,
          numLoops: action.value,
        },
      };

    case 'TOGGLE_SPIN':
      return {...state,
        transform: {...state.transform,
          spinEnabled: !state.transform.spinEnabled,
        },
      };

    case 'TOGGLE_GROW':
      return {...state,
        transform: {...state.transform,
          growEnabled: !state.transform.growEnabled,
        },
      };

    case 'TOGGLE_TRACK':
      return {...state,
        transform: {...state.transform,
          trackEnabled: !state.transform.trackEnabled,
        },
      };

    case 'TOGGLE_TRACK_GROW':
      return {...state,
        transform: {...state.transform,
          trackGrowEnabled: !state.transform.trackGrowEnabled,
        },
      };

    case 'SET_SPIN':
      return {...state,
        transform: {...state.transform,
          spinValue: action.value,
        },
      };

    case 'SET_GROW':
      return {...state,
        transform: {...state.transform,
          growValue: action.value,
        },
      };

    case 'SET_TRACK':
      return {...state,
        transform: {...state.transform,
          trackValue: action.value,
        },
      };

    case 'SET_TRACK_LENGTH':
      return {...state,
        transform: {...state.transform,
          trackLength: action.value,
        },
      };

    case 'SET_TRACK_GROW':
      return {...state,
        transform: {...state.transform,
          trackGrow: action.value,
        },
      };

    // File actions
    case 'SET_FILE_VERTICES':
      return {...state,
        file: {...state.file,
          vertices : action.vertices,
        },
      };
    case 'SET_FILE_NAME':
      return {...state,
        file: {...state.file,
          name: action.value,
        },
      };
    case 'SET_FILE_COMMENT':
      return {...state,
        file: {...state.file,
          comment: action.value,
        },
      };
    case 'SET_FILE_ZOOM':
      return {...state,
        file: {...state.file,
          zoom: action.value,
        },
      };
    case 'TOGGLE_FILE_ASPECT_RATIO':
      return {...state,
        file: {...state.file,
          aspectRatio: !state.file.aspectRatio,
        },
      };

    // Vertex actions
    case 'CHOOSE_INPUT':
      return {...state,
        app: {...state.app,
          input: action.value,
        },
      };
    case 'TOGGLE_REVERSE':
      return {...state,
        app: {...state.app,
          reverse: !state.app.reverse,
        },
      };

    // Wiper Settings
    case 'SET_WIPER_ANGLE_DEG':
      return {...state,
        wiper: {...state.wiper,
          angleDeg: action.value,
        },
      };
    case 'SET_WIPER_SIZE':
      return {...state,
        wiper: {...state.wiper,
          size: action.value,
        },
      };

    // Machine Settings
    case 'TOGGLE_MACHINE_RECT_EXPANDED':
      return {...state,
        machine: {...state.machine,
          rectangular: true,
        },
        app: {...state.app,
          machineRectExpanded: !state.app.machineRectExpanded,
          machinePolarExpanded: false,
        },
      };

    case 'TOGGLE_MACHINE_POLAR_EXPANDED':
      return {...state,
        machine: {...state.machine,
          rectangular: false,
        },
        app: {...state.app,
          machinePolarExpanded: !state.app.machinePolarExpanded,
          machineRectExpanded: false,
        },
      };

    case 'SET_MIN_X':
      return {...state,
        machine: {...state.machine,
          min_x: action.value,
        },
      };
    case 'SET_MAX_X':
      return {...state,
        machine: {...state.machine,
          max_x: action.value,
        },
      };
    case 'SET_MIN_Y':
      return {...state,
        machine: {...state.machine,
          min_y: action.value,
        },
      };
    case 'SET_MAX_Y':
      return {...state,
        machine: {...state.machine,
          max_y: action.value,
        },
      };
    case 'SET_MAX_RADIUS':
      return {...state,
        machine: {...state.machine,
          max_radius: action.value,
        },
      };
    case 'SET_MACHINE_RECT_ORIGIN':
      let newValue = [];
      for (let i = 0; i < action.value.length ; i++) {
        if (!state.machine.rectOrigin.includes(action.value[i])) {
          newValue.push(action.value[i]);
          break;
        }
      }

      return {...state,
        machine: {...state.machine,
          rectOrigin: newValue,
        },
      };
    case 'TOGGLE_MACHINE_ENDPOINTS':
      return {...state,
        machine: {...state.machine,
          polarEndpoints: !state.machine.polarEndpoints,
        },
      };
    case 'SET_MACHINE_SIZE':
      return {...state,
        app: {...state.app,
          canvas_width: action.value,
          canvas_height: action.value,
        },
      };
    case 'SET_MACHINE_SLIDER':
      return {...state,
        app: {...state.app,
          machineSlider: action.value,
        },
      };
    case 'SET_SHOW_GCODE':
      return {...state,
        app: {...state.app,
          showGCode: action.value,
        },
      };

    // GCode Settings
    case 'SET_GCODE_FILENAME':
      return {...state,
        gcode: {...state.gcode,
          filename: action.value,
        },
      };
    case 'SET_GCODE_PRE':
      return {...state,
        gcode: {...state.gcode,
          pre: action.value,
        },
      };
    case 'SET_GCODE_POST':
      return {...state,
        gcode: {...state.gcode,
          post: action.value,
        },
      };
    case '@@redux/INIT':
      return state;

    default:
      console.log('unknown action.type: ' + action.type);
      return state;
  }
};

export default reducer;
