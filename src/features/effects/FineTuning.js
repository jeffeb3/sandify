import Victor from "victor"
import { arrayRotate } from "@/common/util"
import {
  cloneVertices,
  isLoop,
  totalDistance,
  distance,
  boundingVerticesAtLength,
} from "@/common/geometry"
import Effect from "./Effect"

const options = {
  backtrackPct: {
    title: "Backtrack at end (%)",
    min: 0,
    max: 100,
    step: 2,
  },
  drawPortionPct: {
    title: "Draw portion of path (%)",
    min: 0,
    max: 100,
    step: 2,
  },
  rotateStartingPct: {
    title: "Rotate starting point (%)",
    min: -100,
    max: 100,
    step: 2,
  },
}

export default class FineTuning extends Effect {
  constructor() {
    super("fineTuning")
    this.label = "Fine Tuning"
    this.selectGroup = "effects"
  }

  canChangeSize(state) {
    return false
  }

  canRotate(state) {
    return false
  }

  canMove(state) {
    return false
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        drawPortionPct: 100,
        backtrackPct: 0,
        rotateStartingPct: 0,
      },
    }
  }

  getVertices(effect, layer, vertices) {
    if (
      effect.rotateStartingPct === undefined ||
      effect.rotateStartingPct !== 0
    ) {
      vertices = this.rotateStartingPoint(vertices, effect)
    }

    if (effect.drawPortionPct !== undefined) {
      vertices = this.drawPortion(vertices, effect)
    }

    if (effect.backtrackPct !== 0) {
      vertices = this.backtrack(vertices, effect)
    }

    return vertices
  }

  // rotates the starting point of the shape based on a percentage of the overall length;
  // adds a new vertex along the path to match the given percentage.
  rotateStartingPoint(vertices, effect) {
    let rotation = effect.rotateStartingPct
    if (rotation < 0) {
      rotation = 100 + rotation
    }

    const loop = isLoop(vertices)
    const { vNew, index2 } = this.getBoundingSegment(vertices, rotation)

    vertices.splice(index2, 0, vNew)
    vertices = arrayRotate(vertices, index2)

    if (loop) {
      // close the loop
      vertices.push(Victor.fromObject(vertices[0]))
    }

    return vertices
  }

  // draws a percentage-based portion of the shape; adds a new vertex along the path
  // to match the given percentage.
  drawPortion(vertices, effect) {
    const { vNew, index2 } = this.getBoundingSegment(
      vertices,
      effect.drawPortionPct,
    )

    vertices.splice(index2)
    vertices.push(vNew)

    return vertices
  }

  // backtracks a percentage-based distance along the the shape's path; adds a new vertex
  // along the path to match the given percentage.
  backtrack(vertices, effect) {
    const reversedVertices = [...vertices].reverse()
    const { vNew, index2 } = this.getBoundingSegment(
      reversedVertices,
      effect.backtrackPct,
    )
    const backtrackVertices = cloneVertices(reversedVertices.slice(0, index2))
    backtrackVertices.push(vNew)

    return vertices.concat(backtrackVertices)
  }

  // given an array of vertices and a percentage, returns a new vertex (vNew) positioned at
  // the percentage-based distance along the path, along with the two vertices (v1, v2) that bound
  // it on either side.
  getBoundingSegment(vertices, pct) {
    const d = Math.round((totalDistance(vertices) * pct) / 100.0)
    const [v1, v2] = boundingVerticesAtLength(vertices, d)
    const segmentLength = distance(v1, v2)
    const d2 = d - totalDistance(vertices.slice(0, vertices.indexOf(v1) + 1))
    const vNew = new Victor(
      v1.x + (d2 * (v2.x - v1.x)) / segmentLength,
      v1.y + (d2 * (v2.y - v1.y)) / segmentLength,
    )
    const index2 = vertices.indexOf(v2)

    return {
      v1,
      v2,
      vNew,
      index2,
    }
  }

  getOptions() {
    return options
  }
}
