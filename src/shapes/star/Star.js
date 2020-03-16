import { Vertex } from '../../common/Geometry'
import starReducer, {
  setShapeStarRatio,
  setShapeStarPoints
} from './starSlice.js'

export class Star {
  static initialState() {
    return {
      star_points: 5,
      star_ratio: 0.5
    }
  }

  static reducer(state, action) {
    return starReducer(state, action)
  }

  static mapState(state, ownProps) {
    return {
      star_points:   state.shapes.star_points,
      star_ratio:    state.shapes.star_ratio,
    }
  }

  static mapDispatch(dispatch, ownProps) {
    return {
      onStarPointsChange: (event) => {
        dispatch(setShapeStarPoints(event.target.value));
      },
      onStarRatioChange: (event) => {
        dispatch(setShapeStarRatio(event.target.value));
      },
    }
  }

  static getInfo() {
    return {
      name: "Star",
      vertices: (state) => {
        let star_points = [];
        for (let i=0; i<state.shapes.star_points * 2; i++) {
          let angle = Math.PI * 2.0 / (2.0 * state.shapes.star_points) * i;
          let star_scale = 1.0;
          if (i % 2 === 0) {
            star_scale *= state.shapes.star_ratio;
          }
          star_points.push(Vertex(star_scale * Math.cos(angle), star_scale * Math.sin(angle)))
        }
        return star_points
      },
      options: [
        {
          title: "Number of Points",
          key: "starPoints",
          value: (props) => { return props.star_points },
          onChange: (props) => { return props.onStarPointsChange },
        },
        {
          title: "Size of Points",
          key: "starRatio",
          value: (props) => { return props.star_ratio },
          onChange: (props) => { return props.onStarRatioChange },
          step: 0.05,
        },
      ],
    };
  }
}
