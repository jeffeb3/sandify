import { Vertex } from '../common/Geometry.js';

export const setShapePolygonSides = ( sides ) => {
  return {
    type: 'SET_SHAPE_POLYGON_SIDES',
    value: sides,
  };
}

export class Polygon {
  static mapStateToProps(state, ownProps) {
    return {
      polygon_sides: state.shapes.polygon_sides,
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
        for (let i=0; i<state.shapes.polygon_sides; i++) {
          let angle = Math.PI * 2.0 / state.shapes.polygon_sides * (0.5 + i);
          points.push(Vertex(Math.cos(angle), Math.sin(angle)))
        }
        return points;
      },
      options: [
        {
          title: "Number of Sides",
          key: "polygon_sides",
          value: () => { return parent.props.polygon_sides },
          onChange: parent.props.onPolygonSizeChange,
        },
      ],
    };
  }

  static getReducer(state, action) {
    switch(action.type) {
      case 'SET_SHAPE_POLYGON_SIDES':
        return {...state,
          polygon_sides: action.value,
        };

      default:
        return state;
    }
  }
}
