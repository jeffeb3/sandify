import Vicious1Vertices from './Vicious1Vertices'
import v1EngineeringReducer from './v1EngineeringSlice.js'

export class V1Engineering {
  static initialState() {
    return {}
  }

  static reducer(state, action) {
    return v1EngineeringReducer(state, action)
  }

  static mapState(state, ownProps) {
    return {

    }
  }

  static mapDispatch(dispatch, ownProps) {
    return {

    }
  }

  static getInfo() {
    return {
      name: "V1Engineering",
      vertices: (state) => {
        return Vicious1Vertices();
      },
      options: [],
    }
  }
}
