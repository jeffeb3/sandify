
const defaultState = {
  sandifyVersion: "0.1.4",
  input: 0,
  reverse: false,
  canvas_width: 600,
  canvas_height: 600,
  machineSlider: 0.0,
  machineRectExpanded: false,
  machinePolarExpanded: false,
  showGCode: false,
}

export default function app(state = defaultState, action) {
  switch (action.type) {

    // Vertex actions
    case 'CHOOSE_INPUT':
      return {...state,
        input: action.value,
      };
    case 'TOGGLE_REVERSE':
      return {...state,
        reverse: !state.reverse,
      };
    case 'SET_MACHINE_SIZE':
      return {...state,
        canvas_width: action.value,
        canvas_height: action.value,
      };
    case 'SET_MACHINE_SLIDER':
      return {...state,
        machineSlider: action.value,
      };
    case 'TOGGLE_MACHINE_RECT_EXPANDED':
      return {...state,
        machineRectExpanded: !state.machineRectExpanded,
        machinePolarExpanded: false,
      };
    case 'TOGGLE_MACHINE_POLAR_EXPANDED':
      return {...state,
        machinePolarExpanded: !state.machinePolarExpanded,
        machineRectExpanded: false,
      };
    case 'SET_SHOW_GCODE':
      return {...state,
        showGCode: action.value,
      };


    case '@@redux/INIT':
      return state;
    default:
      return state;
  }
}



