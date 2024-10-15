import Victor from "victor"
import convexHull from "convexhull-js"
import { arrayRotate } from "@/common/util"
import {
  cloneVertex,
  cloneVertices,
  isLoop,
  totalDistance,
  distance,
  boundingVerticesAtLength,
} from "@/common/geometry"
import { closest } from "@/common/proximity"
import Effect from "./Effect"

const options = {
  reverse: {
    title: "1: Reverse path",
    type: "checkbox",
    isVisible: (model, state) => {
      return !model.effect
    },
  },
  rotateStartingPct: {
    title: "2: Move start point (%)",
    min: 0,
    max: 100,
    step: 2,
  },
  drawPortionPct: {
    title: "3: Draw path (%)",
    min: 0,
    max: 100,
    step: 2,
  },
  drawBorder: {
    title: "4: Add perimeter border",
    type: "checkbox",
  },
  backtrackPct: {
    title: "5: Backtrack at end (%)",
    min: 0,
    max: 100,
    step: 2,
  },
}

export default class FineTuning extends Effect {
  constructor() {
    super("fineTuning")
    this.label = "Fine tuning"
    this.selectGroup = "effects"
    this.randomizable = false
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
        reverse: false,
        drawBorder: false,
      },
    }
  }

  getVertices(effect, layer, vertices) {
    if (vertices.length > 1) {
      if (effect.reverse) {
        vertices = vertices.reverse()
      }

      if (
        effect.rotateStartingPct === undefined ||
        effect.rotateStartingPct !== 0
      ) {
        vertices = this.moveStartingPoint(vertices, effect)
      }

      if (effect.drawPortionPct !== undefined) {
        vertices = this.drawPortion(vertices, effect)
      }

      if (effect.drawBorder) {
        vertices = this.drawBorder(vertices, effect)
      }

      if (effect.backtrackPct !== 0) {
        vertices = this.backtrack(vertices, effect)
      }
    }

    return vertices
  }

  // moves the starting point of the shape based on a percentage of the overall length;
  // adds a new vertex along the path to match the given percentage.
  moveStartingPoint(vertices, effect) {
    let rotation = effect.rotateStartingPct
    if (rotation < 0) {
      rotation = 100 + rotation
    }

    const { vNew, index2 } = this.getBoundingSegment(vertices, rotation)

    if (isLoop(vertices)) {
      // can do this efficiently by rotating where we start along the same vertices
      vertices.splice(index2, 0, vNew)
      vertices = arrayRotate(vertices, index2)

      // close the loop
      vertices.push(cloneVertex(vertices[0]))
    } else {
      // can't rotate, so instead we'll reverse trace to get to our original starting
      // point and then draw the shape normally from there.
      const newVertices = vertices.splice(0, index2)
      const reversedNewVertices = cloneVertices(newVertices).reverse()
      vertices = [...reversedNewVertices, ...newVertices, ...vertices]
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

  drawBorder(vertices, effect) {
    let hull = convexHull(cloneVertices(vertices))
    const last = vertices[vertices.length - 1]
    const closestVertex = closest(hull, last)
    const index = hull.indexOf(closestVertex)
    hull = arrayRotate(hull, index)

    hull.forEach((vertex) => {
      vertices.push(vertex)
    })
    vertices.push(cloneVertex(hull[0]))

    return vertices
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
