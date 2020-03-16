import { Vertex } from '../../common/Geometry.js';
import polygonReducer, { setShapePolygonSides } from './polygonSlice.js'

export class Polygon {
  static initialState() {
    return {
      polygon_sides: 4
    }
  }
  
  static reducer(state, action) {
    return polygonReducer(state, action)
  }

  static mapState(state, ownProps) {
    return {
      polygon_sides: state.shapes.polygon_sides,
    }
  }

  static mapDispatch(dispatch, ownProps) {
    return {
      onPolygonSizeChange: (event) => {
        dispatch(setShapePolygonSides(event.target.value));
      },
    }
  }

  static getInfo() {
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
          value: (props) => { return props.polygon_sides },
          onChange: (props) => { return props.onPolygonSizeChange },
        },
      ],
    }
  }
}
