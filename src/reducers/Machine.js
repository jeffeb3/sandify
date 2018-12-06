
const defaultState = {
  // Machine settings
  machineRectActive: undefined !== localStorage.getItem('machine_rect_active') ? localStorage.getItem('machine_rect_active') < 2 : true,
  machineRectExpanded: false,
  min_x: parseFloat(localStorage.getItem('machine_min_x') ? localStorage.getItem('machine_min_x') : 0),
  max_x: parseFloat(localStorage.getItem('machine_max_x') ? localStorage.getItem('machine_max_x') : 500),
  min_y: parseFloat(localStorage.getItem('machine_min_y') ? localStorage.getItem('machine_min_y') : 0),
  max_y: parseFloat(localStorage.getItem('machine_max_y') ? localStorage.getItem('machine_max_y') : 500),
  machinePolarExpanded: false,
  max_radius: localStorage.getItem('machine_radius') ? localStorage.getItem('machine_radius') : 250,
  canvas_width: 600,
  canvas_height: 600,
}

export default function machine(state = defaultState, action) {
  switch (action.type) {
    // Machine Settings
    case 'TOGGLE_MACHINE_RECT_EXPANDED':
      return computeInput({...state,
        machineRectActive: true,
        machineRectExpanded: !state.machineRectExpanded,
        machinePolarExpanded: false,
      });

    case 'TOGGLE_MACHINE_POLAR_EXPANDED':
      return computeInput({...state,
        machinePolarExpanded: !state.machinePolarExpanded,
        machineRectActive: false,
        machineRectExpanded: false,
      });

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
    case 'SET_MAX_RADIUS':
      return computeInput({...state,
        max_radius: action.value,
      });
    case 'SET_MACHINE_SIZE':
      return computeInput({...state,
        canvas_width: action.value,
        canvas_height: action.value,
      });
    default:
      console.log('unknown action.type: ' + action.type);
      return state;
  };
}



