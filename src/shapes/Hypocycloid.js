import { Vertex } from '../Geometry';

export const setShapehypocycloidA = ( a ) => {
  return {
    type: 'SET_SHAPE_HYPOCYCLOID_A',
    value: a,
  };
}

export const setShapehypocycloidB = ( b ) => {
  return {
    type: 'SET_SHAPE_HYPOCYCLOID_B',
    value: b,
  };
}

export class Hypocycloid {
  static mapStateToProps(state, ownProps) {
    return {
      hypocycloidA: state.shapes.hypocycloidA,
      hypocycloidB: state.shapes.hypocycloidB,
    }
  }

  static mapDispatchToProps(dispatch, ownProps) {
    return {
      onhypocycloidAChange: (event) => {
        dispatch(setShapehypocycloidA(event.target.value));
      },
      onhypocycloidBChange: (event) => {
        dispatch(setShapehypocycloidB(event.target.value));
      },
    }
  }

  static getParams(parent) {
    return {
      name: "Web",
      link: "http://mathworld.wolfram.com/Hypocycloid.html",
      vertices: (state) => {
        let points = []
        let a = parseFloat(state.shapes.hypocycloidA)
        let b = parseFloat(state.shapes.hypocycloidB)

        for (let i=0; i<128; i++) {
          let angle = Math.PI * 2.0 / 128.0 * i
          points.push(Vertex(1.0 * (a - b) * Math.cos(angle) + b * Math.cos(((a - b) / b) * angle),
                                1.0 * (a - b) * Math.sin(angle) - b * Math.sin(((a - b) / b) * angle)))
        }
        return points
      },
      options: [
        {
          title: "Large circle radius",
          key: "hypocycloidA",
          value: () => { return parent.props.hypocycloidA },
          onChange: parent.props.onhypocycloidAChange,
          step: 0.1,
        },
        {
          title: "Small circle radius",
          key: "hypocycloidB",                    
          value: () => { return parent.props.hypocycloidB },
          onChange: parent.props.onhypocycloidBChange,
          step: 0.1,
        },
      ],
    };
  }

  static getReducer(state, action) {
    switch(action.type) {
      case 'SET_SHAPE_HYPOCYCLOID_A':
        return {...state,
          hypocycloidA: action.value,
        };

      case 'SET_SHAPE_HYPOCYCLOID_B':
        return {...state,
          hypocycloidB: action.value,
        };

      default:
        return state;
    }
  }
}
