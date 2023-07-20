import Victor from "victor"
import Model from "./Model"

const options = {
  ...shapeOptions,
  ...{
    freeformPoints: {
      title: "Points",
      type: "input",
    },
  },
}

export default class Freeform extends Model {
  constructor() {
    super("freeform")
    this.startingWidth = 50
    this.startingHeight = 50
  }

  canChangeHeight(state) {
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
