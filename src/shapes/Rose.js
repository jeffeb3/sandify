import { Vertex } from '../Geometry';

export const setShapeRoseN = ( n ) => {
  return {
    type: 'SET_SHAPE_ROSE_N',
    value: n,
  };
}

export const setShapeRoseD = ( d ) => {
  return {
    type: 'SET_SHAPE_ROSE_D',
    value: d,
  };
}

export class Rose {
  static mapStateToProps(state, ownProps) {
    return {
      roseN: state.shapes.roseN,
      roseD: state.shapes.roseD,
    }
  }

  static mapDispatchToProps(dispatch, ownProps) {
    return {
      onRoseNChange: (event) => {
        dispatch(setShapeRoseN(event.target.value));
      },
      onRoseDChange: (event) => {
        dispatch(setShapeRoseD(event.target.value));
      },
    }
  }

  static getParams(parent) {
    return {
      name: "Rose",
      link: "http://mathworld.wolfram.com/Rose.html",
      vertices: (state) => {
        let points = []
        let a = 2
        let n = parseInt(state.shapes.roseN)
        let d = parseInt(state.shapes.roseD)
        let p = (n * d % 2 === 0) ? 2 : 1
        let thetaClose = d * p * 32 * n;
        let resolution = 64 * n;

        for (let i=0; i<thetaClose+1; i++) {
          let theta = Math.PI * 2.0 / (resolution) * i
          let r = 0.5 * a * Math.sin((n / d) * theta)
          points.push(Vertex(r * Math.cos(theta), r * Math.sin(theta)))
        }
        return points
      },
      options: [
        {
          title: "Numerator",
          key: "roseN",
          value: () => { return parent.props.roseN },
          onChange: parent.props.onRoseNChange,
          step: 1,
        },
        {
          title: "Denominator",
          key: "roseD",          
          value: () => { return parent.props.roseD },
          onChange: parent.props.onRoseDChange,
          step: 1,
        },
      ],
    };
  }

  static getReducer(state, action) {
    switch(action.type) {
      case 'SET_SHAPE_ROSE_N':
        return {...state,
          roseN: action.value,
        };

      case 'SET_SHAPE_ROSE_D':
        return {...state,
          roseD: action.value,
        };

      default:
        return state;
    }
  }
}
