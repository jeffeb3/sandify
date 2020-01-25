import { Vertex } from '../Geometry';

export class Heart {
  static mapStateToProps(state, ownProps) {
    return {

    }
  }

  static mapDispatchToProps(dispatch, ownProps) {
    return {

    }
  }

  static getParams(parent) {
    return {
      name: "Heart",
      vertices: (state) => {
        let heart_points = []
        for (let i=0; i<128; i++) {
          let angle = Math.PI * 2.0 / 128.0 * i
          // heart equation from: http://mathworld.wolfram.com/HeartCurve.html
          heart_points.push(Vertex(1.0 * Math.pow(Math.sin(angle), 3),
                                   13.0/16.0 * Math.cos(angle) +
                                   -5.0/16.0 * Math.cos(2.0 * angle) +
                                   -2.0/16.0 * Math.cos(3.0 * angle) +
                                   -1.0/16.0 * Math.cos(4.0 * angle)))
        }
        return heart_points
      },
      options: [
      ],
    };
  }

  static getReducer(state, action) {
    switch(action.type) {
      default:
        return state;
    }
  }
}
