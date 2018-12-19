
const defaultState = {
  filename: "sandify",
  pre: localStorage.getItem('gcode_pre') ? localStorage.getItem('gcode_pre') : '',
  post: localStorage.getItem('gcode_post') ? localStorage.getItem('gcode_post') : '',
}

export default function gcode(state = defaultState, action) {
  switch (action.type) {

    // GCode Settings
    case 'SET_GCODE_FILENAME':
      return {...state,
        filename: action.value,
      };
    case 'SET_GCODE_PRE':
      return {...state,
        pre: action.value,
      };
    case 'SET_GCODE_POST':
      return {...state,
        post: action.value,
      };

    case '@@redux/INIT':
      return state;
    default:
      return state;
  }
}



