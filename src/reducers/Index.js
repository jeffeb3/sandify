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
