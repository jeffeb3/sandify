import { Vertex } from '../Geometry';

export const setShapeepicycloidA = ( a ) => {
  return {
    type: 'SET_SHAPE_EPICYCLOID_A',
    value: a,
  };
}

export const setShapeepicycloidB = ( b ) => {
  return {
    type: 'SET_SHAPE_EPICYCLOID_B',
    value: b,
  };
}

export class Epicycloid {
  static mapStateToProps(state, ownProps) {
    return {
      epicycloidA: state.shapes.epicycloidA,
      epicycloidB: state.shapes.epicycloidB,
    }
  }

  static mapDispatchToProps(dispatch, ownProps) {
    return {
      onepicycloidAChange: (event) => {
        dispatch(setShapeepicycloidA(event.target.value));
      },
      onepicycloidBChange: (event) => {
        dispatch(setShapeepicycloidB(event.target.value));
      },
    }
  }

  static getParams(parent) {
    return {
      name: "Clover",
      link: "http://mathworld.wolfram.com/Epicycloid.html",
      vertices: (state) => {
        let points = []
        let a = parseFloat(state.shapes.epicycloidA)
        let b = parseFloat(state.shapes.epicycloidB)

        for (let i=0; i<128; i++) {
          let angle = Math.PI * 2.0 / 128.0 * i
          points.push(Vertex(0.5 * (a + b) * Math.cos(angle) - 0.5 * b * Math.cos(((a + b) / b) * angle),
                             0.5 * (a + b) * Math.sin(angle) - 0.5 * b * Math.sin(((a + b) / b) * angle)))
        }
        return points
      },
      options: [
        {
          title: "Large circle radius",
          key: "epicycloidA",
          value: () => { return parent.props.epicycloidA },
          onChange: parent.props.onepicycloidAChange,
          step: 0.1,
        },
        {
          title: "Small circle radius",
          key: "epicycloidB",
          value: () => { return parent.props.epicycloidB },
          onChange: parent.props.onepicycloidBChange,
          step: 0.1,
        },
      ],
    };
  }

  static getReducer(state, action) {
    switch(action.type) {
      case 'SET_SHAPE_EPICYCLOID_A':
        return {...state,
          epicycloidA: action.value,
        };

      case 'SET_SHAPE_EPICYCLOID_B':
        return {...state,
          epicycloidB: action.value,
        };

      default:
        return state;
    }
  }
}
