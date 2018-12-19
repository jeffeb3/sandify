
const defaultState = {
  angleDeg: 15,
  size: 12,
}

export default function wiper(state = defaultState, action) {
  switch (action.type) {

    // Wiper Settings
    case 'SET_WIPER_ANGLE_DEG':
      return {...state,
        angleDeg: action.value,
      };
    case 'SET_WIPER_SIZE':
      return {...state,
        size: action.value,
      };

    case '@@redux/INIT':
      return state;
    default:
      return state;
  }
}



