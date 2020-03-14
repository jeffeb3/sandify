import { Vertex } from '../common/Geometry';

export const setShapeCircleLobes = ( sides ) => {
  return {
    type: 'SET_SHAPE_CIRCLE_LOBES',
    value: sides,
  };
}

export class Circle {
  static mapStateToProps(state, ownProps) {
    return {
      circle_lobes: state.shapes.circle_lobes,
    }
  }

  static mapDispatchToProps(dispatch, ownProps) {
    return {
      onCircleLobesChange: (event) => {
        dispatch(setShapeCircleLobes(event.target.value));
      },
    }
  }

  static getParams(parent) {
    return {
      name: "Circle",
      vertices: (state) => {
        let circle_points = []
        for (let i=0; i<128; i++) {
          let angle = Math.PI * 2.0 / 128.0 * i
          circle_points.push(Vertex(Math.cos(angle), Math.sin(state.shapes.circle_lobes * angle)/state.shapes.circle_lobes))
        }
        return circle_points
      },
      options: [
        {
          title: "Number of Lobes",
          key: "circleLobes",
          value: () => { return parent.props.circle_lobes },
          onChange: parent.props.onCircleLobesChange,
        },
      ],
    };
  }

  static getReducer(state, action) {
    switch(action.type) {
      case 'SET_SHAPE_CIRCLE_LOBES':
        return {...state,
          circle_lobes: action.value,
        };

      default:
        return state;
    }
  }
}
