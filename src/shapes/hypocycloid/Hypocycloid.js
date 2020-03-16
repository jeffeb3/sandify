import { Vertex } from '../../common/Geometry'
import hypocycloidReducer, {
  setShapeHypocycloidA,
  setShapeHypocycloidB
} from './hypocycloidSlice.js'

export class Hypocycloid {
  static initialState() {
    return {
      hypocycloid_a: 1.5,
      hypocycloid_b: .25
    }
  }

  static reducer(state, action) {
    return hypocycloidReducer(state, action)
  }

  static mapState(state, ownProps) {
    return {
      hypocycloid_a: state.shapes.hypocycloid_a,
      hypocycloid_b: state.shapes.hypocycloid_b,
    }
  }

  static mapDispatch(dispatch, ownProps) {
    return {
      onHypocycloidAChange: (event) => {
        dispatch(setShapeHypocycloidA(event.target.value));
      },
      onHypocycloidBChange: (event) => {
        dispatch(setShapeHypocycloidB(event.target.value));
      },
    }
  }

  static getInfo() {
    return {
      name: "Web",
      link: "http://mathworld.wolfram.com/Hypocycloid.html",
      vertices: (state) => {
        let points = []
        let a = parseFloat(state.shapes.hypocycloid_a)
        let b = parseFloat(state.shapes.hypocycloid_b)

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
          value: (props) => { return props.hypocycloid_a },
          onChange: (props) => { return props.onHypocycloidAChange },
          step: 0.1,
        },
        {
          title: "Small circle radius",
          key: "hypocycloidB",
          value: (props) => { return props.hypocycloid_b },
          onChange: (props) => { return props.onHypocycloidBChange },
          step: 0.1,
        },
      ],
    };
  }
}
