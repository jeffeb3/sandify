import Victor from "victor"
import convexHull from "convexhull-js"
import { arrayRotate } from "@/common/util"
import {
  centroid,
  cloneVertex,
  cloneVertices,
  isLoop,
  totalDistance,
  distance,
  boundingVerticesAtLength,
} from "@/common/geometry"
import { traceBoundary } from "@/common/boundary"
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
    type: "togglebutton",
    choices: ["none", "tight", "loose"],
  },
  borderPadding: {
    title: "Scale (%)",
    step: 5,
    min: (state) => (state.drawBorder === "tight" ? 0 : undefined),
    max: (state) => (state.drawBorder === "tight" ? 65 : undefined),
    isVisible: (model, state) => {
      return state.drawBorder !== "none"
    },
  },
  borderOnly: {
    title: "Draw border only",
    type: "checkbox",
    isVisible: (model, state) => {
      return state.drawBorder !== "none"
    },
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
        drawBorder: "none",
        borderPadding: 0,
        borderOnly: false,
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

      // Normalize old values to new names
      let borderMode = effect.drawBorder
      if (borderMode === true || borderMode === "convex") borderMode = "loose"
      else if (borderMode === false) borderMode = "none"

      if (borderMode && borderMode !== "none") {
        vertices = this.drawBorder(
          vertices,
          borderMode,
          effect.borderPadding || 0,
          effect.borderOnly || false,
        )
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

  drawBorder(vertices, mode, scale = 0, borderOnly = false) {
    let border

    if (mode === "tight") {
      border = traceBoundary(cloneVertices(vertices), scale)
    } else {
      // "loose" mode - use convex hull
      border = convexHull(cloneVertices(vertices))

      // Apply scaling from centroid
      if (scale !== 0 && border.length > 0) {
        const center = centroid(vertices)
        const scaleFactor = 1 + scale / 100
        border = border.map((v) => {
          return new Victor(
            center.x + (v.x - center.x) * scaleFactor,
            center.y + (v.y - center.y) * scaleFactor,
          )
        })
      }
    }

    // If borderOnly, return just the closed border path
    if (borderOnly) {
      border.push(cloneVertex(border[0]))
      return border
    }

    const last = vertices[vertices.length - 1]
    const closestVertex = closest(border, last)
    const index = border.indexOf(closestVertex)
    border = arrayRotate(border, index)

    // Check if we should trace CW or CCW by comparing distances
    // to the second border vertex vs the last border vertex
    if (border.length > 2) {
      const d1 = distance(last, border[1])
      const d2 = distance(last, border[border.length - 1])

      if (d2 < d1) {
        // Reverse to take the shorter path around
        border = [border[0], ...border.slice(1).reverse()]
      }
    }

    border.forEach((vertex) => {
      vertices.push(vertex)
    })
    vertices.push(cloneVertex(border[0]))

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
