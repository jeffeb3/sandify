import { Vertex } from '../../common/Geometry'
import epicycloidReducer, {
  setShapeEpicycloidA,
  setShapeEpicycloidB
} from './epicycloidSlice.js'

export class Epicycloid {
  static initialState() {
    return {
      epicycloid_a: 1.0,
      epicycloid_b: .25
    }
  }

  static reducer(state, action) {
    return epicycloidReducer(state, action)
  }

  static mapState(state, ownProps) {
    return {
      epicycloid_a: state.shapes.epicycloid_a,
      epicycloid_b: state.shapes.epicycloid_b,
    }
  }

  static mapDispatch(dispatch, ownProps) {
    return {
      onepicycloidAChange: (event) => {
        dispatch(setShapeEpicycloidA(event.target.value));
      },
      onepicycloidBChange: (event) => {
        dispatch(setShapeEpicycloidB(event.target.value));
      },
    }
  }

  static getInfo() {
    return {
      name: "Clover",
      link: "http://mathworld.wolfram.com/Epicycloid.html",
      vertices: (state) => {
        let points = []
        let a = parseFloat(state.shapes.epicycloid_a)
        let b = parseFloat(state.shapes.epicycloid_b)

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
          value: (props) => { return props.epicycloid_a },
          onChange: (props) => { return props.onepicycloidAChange },
          step: 0.1,
        },
        {
          title: "Small circle radius",
          key: "epicycloidB",
          value: (props) => { return props.epicycloid_b },
          onChange: (props) => { return props.onepicycloidBChange },
          step: 0.1,
        },
      ],
    };
  }
}
