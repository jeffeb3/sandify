import { Vertex } from '../Geometry';

export const setShapePolygonSides = ( sides ) => {
  return {
    type: 'SET_SHAPE_POLYGON_SIDES',
    value: sides,
  };
}

export class Polygon {
  static mapStateToProps(state, ownProps) {
    return {
      polygonSides: state.shapes.polygonSides,
    }
  }

  static mapDispatchToProps(dispatch, ownProps) {
    return {
      onPolygonSizeChange: (event) => {
        dispatch(setShapePolygonSides(event.target.value));
      },
    }
  }

  static getParams(parent) {
    return {
      name: "Polygon",
      vertices: (state) => {
        let points = [];
        for (let i=0; i<state.shapes.polygonSides; i++) {
          let angle = Math.PI * 2.0 / state.shapes.polygonSides * (0.5 + i);
          points.push(Vertex(Math.cos(angle), Math.sin(angle)))
        }
        return points;
      },
      options: [
        {
          title: "Number of Sides",
          key: "polygonSides",
          value: () => { return parent.props.polygonSides },
          onChange: parent.props.onPolygonSizeChange,
        },
      ],
    };
  }

  static getReducer(state, action) {
    switch(action.type) {
      case 'SET_SHAPE_POLYGON_SIDES':
        return {...state,
          polygonSides: action.value,
        };

      default:
        return state;
    }
  }
}
