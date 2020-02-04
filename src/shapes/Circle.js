import { Vertex } from '../Geometry';

export const setShapeCircleLobes = ( sides ) => {
  return {
    type: 'SET_SHAPE_CIRCLE_LOBES',
    value: sides,
  };
}

export class Circle {
  static mapStateToProps(state, ownProps) {
    return {
      circleLobes: state.shapes.circleLobes,
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
          circle_points.push(Vertex(Math.cos(angle), Math.sin(state.shapes.circleLobes * angle)/state.shapes.circleLobes))
        }
        return circle_points
      },
      options: [
        {
          title: "Number of Lobes",
          key: "circleLobes",
          value: () => { return parent.props.circleLobes },
          onChange: parent.props.onCircleLobesChange,
        },
      ],
    };
  }

  static getReducer(state, action) {
    switch(action.type) {
      case 'SET_SHAPE_CIRCLE_LOBES':
        return {...state,
          circleLobes: action.value,
        };

      default:
        return state;
    }
  }
}
