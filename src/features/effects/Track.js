import Effect from "./Effect"
import Victor from "victor"
import {
  subsample,
  totalDistances,
  arc,
  circle,
  calculateIntersection,
  cloneVertex,
} from "@/common/geometry"

const orientations = {
  unchanged: "as-is",
  inward: "facing inward",
  outward: "facing outward",
  path: "along path",
}

const options = {
  trackRotation: {
    title: "Track rotation",
    step: 35,
    randomMax: 360,
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
  trackShapeOrientation: {
    title: "Shape orientation",
    type: "dropdown",
    choices: orientations,
    isVisible: (layer, state) => {
      return state.trackPreserveShape
    },
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
        maintainAspectRatio: true,
        trackShape: "circular",
        trackRotation: 360,
        trackSpiralRadiusPct: 0.5,
        trackPreserveShape: false,
        trackNumShapes: 5,
        trackShapeOrientation: "outward",
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
        // add vertex at the intersection of the track and the shape
        let {
          vertex: currentVertex,
          index,
          trackIndex,
        } = this.addTrackConnectionPoints(indexVertices, trackVertices)

        if (currentVertex) {
          // move to the intersection
          const backtrackVertices = indexVertices
            .slice(index, indexVertices.length - 1)
            .reverse()
          backtrackVertices.forEach((vertex) =>
            indexVertices.push(cloneVertex(vertex)),
          )

          // now, draw the track from the intersection to the next shape
          const nextVertices = this.getPreservedVerticesAtIndex(
            i + 1,
            effect,
            vertices,
          )

          // add vertex at the intersection of the track and the next shape
          const {
            vertex: nextVertex,
            index: nextIndex,
            trackIndex: nextTrackIndex,
          } = this.addTrackConnectionPoints(nextVertices, trackVertices, false)

          if (nextVertex) {
            let connectingVertices
            if (trackIndex <= nextTrackIndex) {
              connectingVertices = trackVertices.slice(
                trackIndex,
                nextTrackIndex,
              )
            } else {
              connectingVertices = trackVertices
                .slice(nextTrackIndex, trackIndex)
                .reverse()
            }

            connectingVertices.forEach((vertex) =>
              indexVertices.push(cloneVertex(vertex)),
            )

            // lastly, move from the intersection to the start of the next shape
            const backtrackVertices = nextVertices.slice(0, nextIndex).reverse()
            backtrackVertices.forEach((vertex) =>
              indexVertices.push(cloneVertex(vertex)),
            )
          }
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

  // finds the intersection between the track and the shape, and splices the intersection
  // vertex into both sets of vertices.
  addTrackConnectionPoints(vertices, trackVertices, last = true) {
    const intersection = this.findTrackIntersectionPoint(
      trackVertices,
      vertices,
      last,
    )
    if (intersection) {
      const vertex = cloneVertex(intersection.intersection)
      vertices.splice(intersection.indexB + 1, 0, vertex)
      const index = vertices.findIndex((v) => v == vertex)

      const trackVertex = cloneVertex(intersection.intersection)
      trackVertices.splice(intersection.indexA + 1, 0, trackVertex)
      const trackIndex = trackVertices.findIndex((v) => v == trackVertex)

      return {
        vertex,
        index,
        trackVertex,
        trackIndex,
      }
    } else {
      return {}
    }
  }

  // returhs the point in path B that intersects with path A
  findTrackIntersectionPoint(pathA, pathB, last = true) {
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

    return intersections[last ? 0 : intersections.length - 1]
  }

  getPreservedVerticesAtIndex(index, effect, vertices) {
    const {
      width,
      trackSpiralRadiusPct,
      trackNumShapes,
      trackRotation,
      trackShape,
      trackShapeOrientation,
    } = effect
    const numShapes =
      trackShape == "circular" && trackRotation === 360
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
      const vertex = cloneVertex(vertices[j])

      if (trackShapeOrientation !== "unchanged") {
        vertex.rotate(
          Math.atan2(offset * Math.sin(angle), offset * Math.cos(angle)) +
            this.additionalTrackRotation(trackShapeOrientation),
        )
      }

      vertex.add({
        x: offset * Math.cos(angle),
        y: offset * Math.sin(angle),
      })

      outputVertices.push(vertex)
    }

    return outputVertices
  }

  additionalTrackRotation(orientation) {
    if (orientation == "inward") {
      return Math.PI / 2
    } else if (orientation == "outward") {
      return (3 * Math.PI) / 2
    } else {
      return 0
    }
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
