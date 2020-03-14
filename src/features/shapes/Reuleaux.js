import { Vertex } from '../common/Geometry';

export const setShapeReuleauxSides = ( sides ) => {
  return {
    type: 'SET_SHAPE_REULEAUX_SIDES',
    value: sides,
  };
}

export class Reuleaux {
  static mapStateToProps(state, ownProps) {
    return {
      reuleaux_sides: state.shapes.reuleaux_sides,
    }
  }

  static mapDispatchToProps(dispatch, ownProps) {
    return {
      onReuleauxSidesChange: (event) => {
        dispatch(setShapeReuleauxSides(event.target.value));
      },
    }
  }

  static getParams(parent) {
    return {
      name: "Reuleaux",
      vertices: (state) => {
        let points = []
        // Construct an equalateral triangle
        let corners = []
        // Initial location at PI/2
        let angle = Math.PI/2.0;
        // How much of the circle in one side?
        let coverageAngle = Math.PI/state.shapes.reuleaux_sides;
        let halfCoverageAngle = 0.5 * coverageAngle;
        for (let c=0; c<state.shapes.reuleaux_sides; c++) {
          let startAngle = angle + Math.PI - halfCoverageAngle;
          corners.push( [Vertex(Math.cos(angle), Math.sin(angle)), startAngle] );
          angle += 2.0 * Math.PI / state.shapes.reuleaux_sides;
        }
        let length = 0.5 / Math.cos(Math.PI/2.0/state.shapes.reuleaux_sides);
        for (let corn=0; corn < corners.length; corn++) {
          for (let i=0; i<128; i++) {
            let angle = coverageAngle  * (i / 128.0) + corners[corn][1];
            points.push(Vertex(length * corners[corn][0].x + Math.cos(angle),
                               length * corners[corn][0].y + Math.sin(angle)));
          }
        }
        return points;
      },
      options: [
        {
          title: "Number of sides",
          key: "reuleauxSides",
          value: () => { return parent.props.reuleaux_sides },
          onChange: parent.props.onReuleauxSidesChange,
          step: 1,
        },
      ],
    };
  }

  static getReducer(state, action) {
    switch(action.type) {
      case 'SET_SHAPE_REULEAUX_SIDES':
        return {...state,
          reuleaux_sides: action.value,
        };

      default:
        return state;
    }
  }
}
