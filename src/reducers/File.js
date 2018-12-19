
const defaultState = {
  name: "",
  comments: [],
  vertices: [],
  zoom: 100,
  aspectRatio: false,
}

export default function file(state = defaultState, action) {
  switch (action.type) {

    // File actions
    case 'SET_FILE_VERTICES':
      return {...state,
        vertices : action.vertices,
      };
    case 'SET_FILE_NAME':
      return {...state,
        name: action.value,
      };
    case 'SET_FILE_COMMENT':
      return {...state,
        comment: action.value,
      };
    case 'SET_FILE_ZOOM':
      return {...state,
        zoom: action.value,
      };
    case 'TOGGLE_FILE_ASPECT_RATIO':
      return {...state,
        aspectRatio: !state.aspectRatio,
      };

    case '@@redux/INIT':
      return state;
    default:
      return state;
  }
}



