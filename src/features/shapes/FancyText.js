import Victor from "victor"
import { arrayRotate } from "@/common/util"
import { pointsOnPath } from "points-on-path"
import pointInPolygon from "point-in-polygon"
import Shape from "./Shape"
import {
  subsample,
  centerOnOrigin,
  maxY,
  minY,
  horizontalAlign,
  findBounds,
  nearestVertex,
  findMinimumVertex,
  dimensions,
} from "@/common/geometry"
import { connectMarkedVerticesAlongMachinePerimeter } from "@/features/machines/util"
import { getFont, supportedFonts } from "@/features/fonts/fontsSlice"

const MIN_SPACING_MULTIPLIER = 1.2
const SPECIAL_CHILDREN = ["i", "j", "?"]

const options = {
  fancyText: {
    title: "Text",
    type: "textarea",
  },
  fancyFont: {
    title: "Font",
    type: "dropdown",
    choices: () => {
      return Object.values(supportedFonts)
    },
  },
  fancyLineSpacing: {
    title: "Line spacing",
    type: "number",
    step: 0.5,
  },
  fancyConnectLines: {
    title: "Connect rows",
    type: "togglebutton",
    choices: ["inside", "outside"],
  },
  fancyAlignment: {
    title: "Alignment",
    type: "togglebutton",
    choices: ["left", "center", "right"],
  },
}

export default class FancyText extends Shape {
  constructor() {
    super("fancyText")
    this.label = "Fancy text"
    this.usesMachine = true
    this.usesFonts = true
    this.stretch = true
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        fancyText: "Sandify",
        fancyFont: "Garamond",
        fancyAlignment: "left",
        fancyConnectLines: "inside",
        fancyLineSpacing: 1.0,
        maintainAspectRatio: true,
      },
    }
  }

  getVertices(state) {
    const font = getFont(state.shape.fancyFont)

    if (font) {
      let words = state.shape.fancyText
        .split("\n")
        .filter((word) => word.length > 0)
      if (words.length === 0) {
        return [new Victor(0, 0)]
      }

      words = words.map((word) => this.drawWord(word, font, state))
      let { offsets, vertices } = this.addVerticalSpacing(words, font, state)

      horizontalAlign(vertices, state.shape.fancyAlignment)
      this.centerOnOrigin(vertices)

      return state.creating
        ? vertices.flat() // machine isn't available here
        : this.connectWords(vertices, offsets, state).flat()
    } else {
      return [new Victor(0, 0)]
    }
  }

  // After transformations are complete, connect words along perimeter.
  finalizeVertices(vertices, state) {
    if (!state.shape.dragging) {
      return connectMarkedVerticesAlongMachinePerimeter(vertices, state.machine)
    } else {
      return vertices
    }
  }

  // hook to modify updates to a layer before they affect the state
  handleUpdate(layer, changes) {
    if (changes.fancyText || changes.fancyFont || changes.fancyLineSpacing) {
      const props = {
        ...layer,
        fancyText: changes.fancyText || layer.fancyText,
        fancyFont: changes.fancyFont || layer.fancyFont,
      }
      const oldVertices = this.getVertices({ shape: layer, creating: true })
      const vertices = this.getVertices({ shape: props, creating: true })
      const { width: oldWidth, height: oldHeight } = dimensions(oldVertices)
      const { width, height } = dimensions(vertices)

      changes.width =
        oldWidth === 0 ? this.startingWidth : (layer.width * width) / oldWidth
      changes.height =
        oldHeight == 0
          ? this.startingHeight
          : (layer.height * height) / oldHeight
      changes.aspectRatio = changes.width / layer.height
    }
  }

  centerOnOrigin(vertices) {
    const bounds = findBounds(vertices.flat())
    vertices.forEach((vs) => centerOnOrigin(vs, bounds))
  }

  // use the specified connection method to draw lines to connect each row in a multi-row phrase
  connectWords(vertices, offsets, state) {
    let newVertices = []

    for (let i = 0; i < vertices.length; i++) {
      const currVertices = vertices[i]

      if (i > 0) {
        const prevVertices = vertices[i - 1]
        const next = currVertices[0]
        const prev = prevVertices[prevVertices.length - 1]

        if (state.shape.fancyConnectLines === "outside") {
          // mark this vertex; we will connect to the next vertice along the machine perimeter
          // once all other transformations have happened
          prev.connector = true
          prev.hidden = true // don't render this line in the preview
        } else {
          // connect the two rows by drawing a horizontal line in the middle of the two rows
          const lowest =
            prevVertices[findMinimumVertex(null, prevVertices, (val, v) => v.y)]
          const highest =
            currVertices[
              findMinimumVertex(null, currVertices, (val, v) => -v.y)
            ]
          newVertices.push(
            new Victor(prev.x, lowest.y - (lowest.y - highest.y) / 2),
          )
          newVertices.push(
            new Victor(next.x, lowest.y - (lowest.y - highest.y) / 2),
          )
        }
      }
      newVertices.push(currVertices)
    }

    return newVertices
  }

  addVerticalSpacing(vertices, font, state) {
    let newVertices = []
    let yOffset = 0
    const offsets = []

    const letterA = this.drawWord("A", font, state)
    const minHeight = (maxY(letterA) - minY(letterA)) * MIN_SPACING_MULTIPLIER

    for (let i = 0; i < vertices.length; i++) {
      const currWord = vertices[i]
      const tempOffset = yOffset // avoid unsafe inclusion warning in next loop

      newVertices.push(currWord.map((v) => new Victor(v.x, v.y - tempOffset)))

      // offset height of each word by a fixed amount
      const offset =
        Math.max(maxY(currWord) - minY(currWord), minHeight) +
        state.shape.fancyLineSpacing
      yOffset += offset
      offsets.push(offset)
    }

    return {
      vertices: newVertices,
      offsets,
    }
  }

  drawWord(word, font, state) {
    const pointsArr = []
    let start = 0

    // build top-level paths with children, sorted from left to right
    const sortedPaths = this.buildOrderedPaths(word, font)

    // draw paths, and connect them together
    for (let i = 0; i < sortedPaths.length; i++) {
      const path = sortedPaths[i]
      let points = path.points
      const nextPath = sortedPaths[i + 1]
      const childPaths = path.children

      if (i === 0) {
        start =
          state.shape.fancyConnectLines === "outside"
            ? findMinimumVertex(null, points, (val, v) => v.x)
            : (start = findMinimumVertex(null, points, (val, v) => -v.y))
      }

      // draw path
      const loop = this.rotateLoop(start, points)
      pointsArr.push(loop)
      start = points.length - 1

      // draw children
      if (childPaths) {
        for (let j = 0; j < childPaths.length; j++) {
          const childPoints = childPaths[j]
          const { segment, end, nextStart } = this.connectPaths(
            start,
            points,
            childPoints,
          )

          pointsArr.push(segment)
          pointsArr.push(this.rotateLoop(nextStart, childPoints))
          pointsArr.push(points[end])
          start = end
        }
      }

      // draw connection to next path
      if (nextPath) {
        const nextPoints = nextPath.points
        const { segment, nextStart } = this.connectPaths(
          start,
          points,
          nextPoints,
        )

        pointsArr.push(segment)
        start = nextStart
      } else {
        const end =
          state.shape.fancyConnectLines === "outside"
            ? findMinimumVertex(null, loop, (val, v) => -v.x)
            : findMinimumVertex(null, loop, (val, v) => v.y)
        pointsArr.push(this.shortestPathAroundLoop(start, end, loop))
      }
    }

    return pointsArr.flat()
  }

  rotateLoop(start, points) {
    if (start) {
      points.pop()
      points = arrayRotate(points, start)
      points.push(points[0])
    }

    return points
  }

  connectPaths(start, points, nextPoints) {
    const pStart = points[start]
    const nextStart = nearestVertex(pStart, nextPoints)
    const next = nextPoints[nextStart]
    const end = nearestVertex(next, points)
    const segment = this.shortestPathAroundLoop(start, end, points)

    segment.push(new Victor(next.x, next.y))
    return { segment, end, nextStart }
  }

  // renders text using an OpenType font and converts it to points we can draw
  convertTextToPoints(text, font) {
    // these values produce fluid text curves at different sizes
    const tolerance = 0.001
    const distance = 0.001
    const fSize = 5
    const x = 0
    const y = 0

    const path = font.getPath(text, x, y, fSize).toPathData()
    return pointsOnPath(path, tolerance, distance).map((path) => {
      return subsample(
        path.map((pt) => new Victor(pt[0], -pt[1])),
        0.2,
      )
    })
  }

  // given a loop of points, returns the shortest path to a given index; the logic can
  // most likely be simplified.
  shortestPathAroundLoop(start, end, loop) {
    if (start > end) {
      if (Math.abs(start - end) > loop.length / 2) {
        // go the other way around
        return loop.slice(start, loop.length - 1).concat(loop.slice(0, end + 1))
      } else {
        return loop.slice(end, start).reverse()
      }
    } else {
      if (Math.abs(start - end) > loop.length / 2) {
        // go the other way around
        return loop
          .slice(end, loop.length - 1)
          .concat(loop.slice(0, start + 1))
          .reverse()
      } else {
        return loop.slice(start, end + 1)
      }
    }
  }

  buildGraph(word, font) {
    const graph = {}
    const points = this.convertTextToPoints(word, font)
    const childMap = this.findExternalChildren(word, font)
    const polygons = points.map((pts) => pts.map((pt) => [pt.x, pt.y]))

    for (let i = 0; i < points.length; i++) {
      if (graph[i]) {
        continue
      }

      // figure out which polygons are top-level letters and which are
      // children; children are mostly internal to the parent letter (e.g.,
      // 'a', 'b'), but there are special external cases that are harder to
      // determine, so we're hard-wiring the rules, e.g. ('i', 'j')
      const samplePoint = [points[i][0].x, points[i][0].y]
      let idx = childMap[i]
      if (idx === undefined) {
        idx = polygons.findIndex((polygon) => {
          return pointInPolygon(samplePoint, polygon)
        })
      }

      if (idx !== -1 && idx !== i) {
        graph[idx] ||= { points: points[idx] }
        graph[idx].children ||= []
        graph[idx].children.push(points[i])
      } else {
        graph[i] = { points: points[i] }
      }
    }

    return graph
  }

  // scans a word for letters which has external child paths and builds a map of this information
  findExternalChildren(word, font) {
    const childMap = {}
    let pos = 0

    for (let i = 0; i < word.length; i++) {
      const paths = this.convertTextToPoints(word[i], font)

      if (SPECIAL_CHILDREN.includes(word[i]) && paths.length > 1) {
        // when given a special child (e.g., "i"), we have to figure out which is the parent and
        // which is the child. The order can differ between fonts.
        const h1 = findMinimumVertex(null, paths[0], (val, v) => -v.y)
        const h2 = findMinimumVertex(null, paths[1], (val, v) => -v.y)

        if (paths[0][h1].y < paths[1][h2].y) {
          childMap[pos + 1] = pos
        } else {
          childMap[pos] = pos + 1
        }
      }

      pos += paths.length
    }

    return childMap
  }

  // returns a list of paths moving from left to right
  buildOrderedPaths(word, font) {
    // construct a graph (two-levels deep) with top-level paths that optionally contain
    // a possible (fully contained) child paths
    const graph = this.buildGraph(word, font)

    return Object.keys(graph)
      .sort((leftIndex, rightIndex) => {
        const leftPoints = graph[leftIndex].points
        const rightPoints = graph[rightIndex].points
        return (
          Math.min(...leftPoints.map((pt) => pt.x)) -
          Math.min(...rightPoints.map((pt) => pt.x))
        )
      })
      .map((key) => graph[key])
  }

  getOptions() {
    return options
  }
}
