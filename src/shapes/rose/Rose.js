import { Vertex } from '../../common/Geometry'
import roseReducer, {
  setShapeRoseN,
  setShapeRoseD
} from './roseSlice.js'

export class Rose {
  static initialState() {
    return {
      rose_n: 3,
      rose_d: 2
    }
  }

  static reducer(state, action) {
    return roseReducer(state, action)
  }

  static mapState(state, ownProps) {
    return {
      rose_n: state.shapes.rose_n,
      rose_d: state.shapes.rose_d,
    }
  }

  static mapDispatch(dispatch, ownProps) {
    return {
      onRoseNChange: (event) => {
        dispatch(setShapeRoseN(event.target.value));
      },
      onRoseDChange: (event) => {
        dispatch(setShapeRoseD(event.target.value));
      },
    }
  }

  static getInfo() {
    return {
      name: "Rose",
      link: "http://mathworld.wolfram.com/Rose.html",
      vertices: (state) => {
        let points = []
        let a = 2
        let n = parseInt(state.shapes.rose_n)
        let d = parseInt(state.shapes.rose_d)
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
          value: (props) => { return props.rose_n },
          onChange: (props) => { return props.onRoseNChange },
          step: 1,
        },
        {
          title: "Denominator",
          key: "roseD",
          value: (props) => { return props.rose_d },
          onChange: (props) => { return props.onRoseDChange },
          step: 1,
        },
      ],
    };
  }
}
