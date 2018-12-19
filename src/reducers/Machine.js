
const defaultState = {
  // Machine settings
  rectangular: undefined !== localStorage.getItem('machine_rect_active') ? localStorage.getItem('machine_rect_active') < 2 : true,
  min_x: parseFloat(localStorage.getItem('machine_min_x') ? localStorage.getItem('machine_min_x') : 0),
  max_x: parseFloat(localStorage.getItem('machine_max_x') ? localStorage.getItem('machine_max_x') : 500),
  min_y: parseFloat(localStorage.getItem('machine_min_y') ? localStorage.getItem('machine_min_y') : 0),
  max_y: parseFloat(localStorage.getItem('machine_max_y') ? localStorage.getItem('machine_max_y') : 500),
  max_radius: localStorage.getItem('machine_radius') ? localStorage.getItem('machine_radius') : 250,
  rectOrigin: [],
  polarEndpoints: false,
}

export default function machine(state = defaultState, action) {
  switch (action.type) {
    // Machine Settings
    case 'TOGGLE_MACHINE_RECT_EXPANDED':
      return {...state,
        rectangular: true,
      };
    case 'TOGGLE_MACHINE_POLAR_EXPANDED':
      return {...state,
        rectangular: false,
      };

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
    case 'SET_MAX_RADIUS':
      return {...state,
        max_radius: action.value,
      };
    case 'SET_MACHINE_RECT_ORIGIN':
      let newValue = [];
      for (let i = 0; i < action.value.length ; i++) {
        if (!state.rectOrigin.includes(action.value[i])) {
          newValue.push(action.value[i]);
          break;
        }
      }
      return {...state,
        rectOrigin: newValue,
      };
    case 'TOGGLE_MACHINE_ENDPOINTS':
      return {...state,
        polarEndpoints: !state.polarEndpoints,
      };
    case '@@redux/INIT':
      return state;
    default:
      return state;
  }
}



