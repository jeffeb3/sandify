import { Vertex } from '../../common/Geometry'
import circleReducer, { setShapeCircleLobes } from './circleSlice.js'

export class Circle {
  static initialState() {
    return {
      circle_lobes: 1
    }
  }

  static reducer(state, action) {
    return circleReducer(state, action)
  }

  static mapState(state, ownProps) {
    return {
      circle_lobes: state.shapes.circle_lobes,
    }
  }

  static mapDispatch(dispatch, ownProps) {
    return {
      onCircleLobesChange: (event) => {
        dispatch(setShapeCircleLobes(event.target.value));
      },
    }
  }

  static getInfo() {
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
          value: (props) => { return props.circle_lobes },
          onChange: (props) => { return props.onCircleLobesChange },
        },
      ],
    }
  }
}
