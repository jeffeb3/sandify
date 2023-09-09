import Victor from "victor"
import Shape from "./Shape"

const options = {
  freeformPoints: {
    title: "Points",
    type: "input",
  },
}

export default class Freeform extends Shape {
  constructor() {
    super("freeform")
    this.startingWidth = 50
    this.startingHeight = 50
  }

  canChangeAspectRatio(state) {
    return false
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        freeformPoints: "-1,-1;-1,1;1,1",
      },
    }
  }

  getVertices(state) {
    return state.shape.freeformPoints.split(";").map((pair) => {
      const coordinates = pair.split(",")
      return new Victor(coordinates[0], coordinates[1])
    })
  }

  getOptions() {
    return options
  }
}
