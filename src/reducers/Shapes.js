import { Polygon } from '../shapes/Polygon.js';
import { Star } from '../shapes/Star.js';
import { Circle } from '../shapes/Circle.js';
import { Heart } from '../shapes/Heart.js';
import { Reuleaux } from '../shapes/Reuleaux.js';
import { Epicycloid } from '../shapes/Epicycloid.js';
import { Hypocycloid } from '../shapes/Hypocycloid.js';
import { Rose } from '../shapes/Rose.js';
import { InputText } from '../shapes/InputText.js';
import { V1Engineering } from '../shapes/V1Engineering.js';
import { registeredShapes } from '../inputs/Transforms.js'

import reduceReducers from 'reduce-reducers';

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
  epicycloidA: 1.0,
  epicycloidB: .25,
  hypocycloidA: 1.0,
  hypocycloidB: .25,
  roseN: 3,
  roseD: 2
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

export default reduceReducers(defaultShapes, ...registeredShapes.map((shape) => shape.getReducer));
