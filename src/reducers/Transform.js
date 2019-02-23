
const defaultState = {
  xformOffsetX: 0.0,
  xformOffsetY: 0.0,
  numLoops: 10,
  growEnabled: false,
  growValue: 100,
  spinEnabled: false,
  spinValue: 2,
  spinSwitchbacks: 0,
  trackEnabled: false,
  trackGrowEnabled: false,
  trackValue: 10,
  trackLength: 0.2,
  trackGrow: 50.0,
}

export default function transform(state = defaultState, action) {
  switch (action.type) {

    case 'SET_SHAPE_OFFSET_X':
      return {...state,
        xformOffsetX: action.value,
      };

    case 'SET_SHAPE_OFFSET_Y':
      return {...state,
        xformOffsetY: action.value,
      };

    case 'SET_LOOPS':
      return {...state,
        numLoops: action.value,
      };

    case 'TOGGLE_SPIN':
      return {...state,
        spinEnabled: !state.spinEnabled,
      };

    case 'TOGGLE_GROW':
      return {...state,
        growEnabled: !state.growEnabled,
      };

    case 'TOGGLE_TRACK':
      return {...state,
        trackEnabled: !state.trackEnabled,
      };

    case 'TOGGLE_TRACK_GROW':
      return {...state,
        trackGrowEnabled: !state.trackGrowEnabled,
      };

    case 'SET_SPIN':
      return {...state,
        spinValue: action.value,
      };

    case 'SET_SPIN_SWITCHBACKS':
      return {...state,
        spinSwitchbacks: (action.value >= 0? action.value : 0),
      };

    case 'SET_GROW':
      return {...state,
        growValue: action.value,
      };

    case 'SET_TRACK':
      return {...state,
        trackValue: action.value,
      };

    case 'SET_TRACK_LENGTH':
      return {...state,
        trackLength: action.value,
      };

    case 'SET_TRACK_GROW':
      return {...state,
        trackGrow: action.value,
      };


    case '@@redux/INIT':
      return state;
    default:
      return state;
  }
}



