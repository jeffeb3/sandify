import Effect from "./Effect"
import Victor from "victor"
import {
  subsample,
  totalDistances,
  arc,
  circle,
  closest,
  calculateIntersection,
} from "@/common/geometry"
const options = {
  trackRotation: {
    title: "Track rotation",
    step: 35,
  },
  trackShape: {
    title: "Track type",
    type: "togglebutton",
    choices: ["circular", "spiral"],
  },
  trackSpiralRadiusPct: {
    title: "Spiral tightness",
    isVisible: (layer, state) => {
      return state.trackShape == "spiral"
    },
    step: 0.1,
  },
  trackPreserveShape: {
    title: "Preserve shape",
    type: "checkbox",
  },
  trackNumShapes: {
    title: "Number of times to draw shape along track",
    isVisible: (layer, state) => {
      return state.trackPreserveShape
    },
    min: 1,
  },
}

export default class Track extends Effect {
  constructor() {
    super("track")
    this.label = "Track"
  }

  canChangeSize(state) {
    return true
  }

  canChangeAspectRatio(state) {
    return false
  }

  canRotate(state) {
    return false
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        width: 50,
        height: 50,
        trackShape: "circle",
        trackRotation: 360,
        trackSpiralRadiusPct: 0.5,
        trackPreserveShape: false,
        trackNumShapes: 5,
      },
    }
  }

  getSelectionVertices(effect) {
    const { width, trackRotation, trackShape } = effect

    if (trackShape == "spiral") {
      return this.spiral(effect)
    } else if (trackRotation < 360) {
      return arc(width, 0, (trackRotation * Math.PI) / 180, 0, 0, false)
    } else {
      return circle(width).reverse()
    }
  }

  getVertices(effect, layer, vertices) {
    if (effect.trackPreserveShape) {
      return this.getPreservedVertices(effect, vertices)
    } else {
      return this.getTransformedVertices(effect, vertices)
    }
  }

  getTransformedVertices(effect, vertices) {
    vertices = subsample(vertices, 2.0)
    const { width, trackSpiralRadiusPct, trackRotation, trackShape } = effect
    const { total, distances } = totalDistances(vertices)
    const spiralRadius = width * trackSpiralRadiusPct
    const outputVertices = []

    for (let j = 0; j < vertices.length; j++) {
      const completeFraction = distances[j] / total
      const angle =
        (completeFraction * parseFloat(trackRotation) * Math.PI) / 180
      const spiralValue =
        trackShape == "spiral" ? (spiralRadius - width) * completeFraction : 0
      const offset = width + spiralValue
      const transformedVertex = new Victor(
        vertices[j].x + offset * Math.cos(angle),
        vertices[j].y + offset * Math.sin(angle),
      )

      outputVertices.push(transformedVertex)
    }

    return outputVertices
  }

  getPreservedVertices(effect, vertices) {
    const newVertices = []
    const trackNumShapes = effect.trackNumShapes
    let trackVertices = this.getSelectionVertices(effect)

    for (let i = 0; i === 0 || i < trackNumShapes; i++) {
      const indexVertices = this.getPreservedVerticesAtIndex(
        i,
        effect,
        vertices,
      )

      if (i < trackNumShapes - 1) {
        // find the best intersection point and add it to our path
        const closestIntersection = this.findTrackIntersectionPoint(
          trackVertices,
          indexVertices,
        )
        if (closestIntersection) {
          let closestStartVertex = Victor.fromObject(
            closestIntersection.intersection,
          )
          indexVertices.splice(
            closestIntersection.indexB + 1,
            0,
            closestStartVertex,
          )
          trackVertices.splice(
            closestIntersection.indexA + 1,
            0,
            closestStartVertex,
          )

          const closestStartIndex = trackVertices.findIndex(
            (vertex) => vertex == closestStartVertex,
          )

          // backtrack to get as close as possible to the first vertex in our next iteration so we
          // draw over it as little as possible
          const startIndex = indexVertices.findIndex(
            (vertex) => vertex == closestStartVertex,
          )
          const backtrackVertices = indexVertices
            .slice(startIndex, indexVertices.length - 1)
            .reverse()
          backtrackVertices.forEach((vertex) =>
            indexVertices.push(Victor.fromObject(vertex)),
          )

          // now, draw the track from here to the first vertex in the next shape iteration
          const nextVertices = this.getPreservedVerticesAtIndex(i + 1, effect, [
            vertices[0],
          ])
          const closestEndVertex = closest(trackVertices, nextVertices[0])
          const closestEndIndex = trackVertices.findIndex(
            (vertex) => vertex == closestEndVertex,
          )

          let connectingVertices
          if (closestStartIndex <= closestEndIndex) {
            connectingVertices = trackVertices.slice(
              closestStartIndex,
              closestEndIndex,
            )
          } else {
            connectingVertices = trackVertices
              .slice(closestEndIndex, closestStartIndex)
              .reverse()
          }

          connectingVertices.forEach((vertex) =>
            indexVertices.push(Victor.fromObject(vertex)),
          )
        } else {
          // this case should not ever happen, but just in case
          console.log(
            "cannot find an intersection between the track and the shape",
          )
        }
      }
      newVertices.push(indexVertices)
    }

    return newVertices.flat()
  }

  // returhs the point in path B that intersects with the furthest possible point on path A
  findTrackIntersectionPoint(pathA, pathB) {
    const intersections = []
    for (let i = 0; i < pathA.length - 1; i++) {
      for (let j = 0; j < pathB.length - 1; j++) {
        let intersection = calculateIntersection(
          pathA[i],
          pathA[i + 1],
          pathB[j],
          pathB[j + 1],
        )
        if (intersection !== null) {
          intersections.push({
            indexA: i,
            indexB: j,
            intersection,
          })
        }
      }
    }
    intersections.sort((a, b) => b.indexA - a.indexA)

    return intersections[0]
  }

  getPreservedVerticesAtIndex(index, effect, vertices) {
    const {
      width,
      trackSpiralRadiusPct,
      trackNumShapes,
      trackRotation,
      trackShape,
    } = effect
    const numShapes =
      trackShape == "circle" && trackRotation === 360
        ? trackNumShapes
        : trackNumShapes - 1
    const spiralRadius = width * trackSpiralRadiusPct
    const shapeCompleteFraction = index / (numShapes || 1)
    const endAngle = (trackRotation * Math.PI) / 180
    const angle = endAngle * shapeCompleteFraction
    const angleCompleteFraction = angle / Math.PI / 2
    const spiralValue =
      trackShape == "spiral"
        ? (spiralRadius - width) * angleCompleteFraction
        : 0
    const offset = width + spiralValue
    const outputVertices = []

    for (let j = 0; j < vertices.length; j++) {
      outputVertices.push(
        new Victor(
          vertices[j].x + offset * Math.cos(angle),
          vertices[j].y + offset * Math.sin(angle),
        ),
      )
    }

    return outputVertices
  }

  getOptions() {
    return options
  }

  spiral(effect) {
    const { width, trackSpiralRadiusPct, trackRotation } = effect
    const spiralRadius = width * trackSpiralRadiusPct
    const endAngle = (trackRotation * Math.PI) / 180
    const resolution = (Math.PI * 2.0) / 128.0
    const vertices = []

    for (let step = 0; step < endAngle / resolution; step++) {
      const completeFraction = step / 128.0
      const spiralValue = (spiralRadius - width) * completeFraction
      const offset = width + spiralValue
      const angle = resolution * step

      vertices.push(
        new Victor(offset * Math.cos(angle), offset * Math.sin(angle)),
      )
    }

    return vertices
  }
}
