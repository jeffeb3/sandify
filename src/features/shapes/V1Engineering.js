import Vicious1Vertices from './Vicious1Vertices';

export class V1Engineering {
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
      name: "V1Engineering",
      vertices: (state) => {
        return Vicious1Vertices();
      },
      options: [],
    };
}

  static getReducer(state, action) {
    switch(action.type) {
      default:
        return state;
    }
  }
}
