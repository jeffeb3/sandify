
const defaultState = {
  // Transform settings
  shapes: [],
  currentShape: "Polygon",
  polygonSides: 4,
  starPoints: 5,
  starRatio: 0.5,
  circleLobes: 1,
  reuleauxSides: 3,
  inputText: "Sandify",
  startingSize: 10.0,

}

export default function shapes(state = defaultState, action) {
  switch (action.type) {

    // shape actions
    case 'ADD_SHAPE':
      return {...state,
          shapes: [...state.shapes,
            action.shape
          ],
      };

    case 'SET_SHAPE':
      return {...state,
        currentShape: action.value,
      };

    case 'SET_SHAPE_POLYGON_SIDES':
      return {...state,
        polygonSides: action.value,
      };

    case 'SET_SHAPE_STAR_POINTS':
      return {...state,
        starPoints: action.value,
      };

    case 'SET_SHAPE_STAR_RATIO':
      return {...state,
        starRatio: action.value,
      };

    case 'SET_SHAPE_CIRCLE_LOBES':
      return {...state,
        circleLobes: action.value,
      };

    case 'SET_SHAPE_REULEAUX_SIDES':
      return {...state,
        reuleauxSides: action.value,
      };

    case 'SET_SHAPE_INPUT_TEXT':
      return {...state,
        inputText: action.value,
      };

    case 'SET_SHAPE_SIZE':
      return {...state,
        startingSize: action.value,
      };

    case '@@redux/INIT':
      return state;
    default:
      return state;
  }
}



