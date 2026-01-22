import Victor from "victor"
import { pointsOnPath } from "points-on-path"
import Shape from "./Shape"
import Graph from "@/common/Graph"
import { eulerianTrail } from "@/common/eulerian_trail/eulerianTrail"
import { eulerizeEdges } from "@/common/chinesePostman"
import {
  subsample,
  centerOnOrigin,
  maxY,
  minY,
  horizontalAlign,
  findBounds,
  findMinimumVertex,
  dimensions,
  cloneVertex,
  distance,
} from "@/common/geometry"
import { connectMarkedVerticesAlongMachinePerimeter } from "@/features/machines/util"
import { getFont, fontNames, getFontWeights } from "@/features/fonts/fontsSlice"

const MIN_SPACING_MULTIPLIER = 1.2 // Minimum line height as multiple of letter "A" height
const FONT_SIZE = 5 // OpenType rendering size; produces fluid curves at different scales
const TOLERANCE = 0.01 // Proximity threshold for merging nearby vertices in graph

const options = {
  fancyText: {
    title: "Text",
    type: "textarea",
  },
  fancyFont: {
    title: "Font",
    type: "dropdown",
    choices: () => fontNames,
  },
  fancyFontWeight: {
    title: "Weight",
    type: "dropdown",
    choices: (data) => getFontWeights(data?.fancyFont) || ["Regular"],
    isVisible: (model, data) =>
      data?.fancyFont && getFontWeights(data.fancyFont) !== null,
  },
  fancyLineSpacing: {
    title: "Line spacing",
    type: "number",
    step: 0.5,
    random: 0.0,
    randomMax: 2,
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
        fancyFontWeight: "Regular",
        fancyAlignment: "left",
        fancyConnectLines: "inside",
        fancyLineSpacing: 1.0,
        maintainAspectRatio: true,
      },
    }
  }

  getVertices(state) {
    const font = getFont(state.shape.fancyFont, state.shape.fancyFontWeight)

    if (font) {
      let words = state.shape.fancyText
        .split("\n")
        .filter((word) => word.length > 0)

      if (words.length === 0) {
        return [new Victor(0, 0)]
      }

      words = words
        .map((word) => this.drawWord(word, font, state))
        .filter((w) => w.length > 0) // Filter out empty results (spaces, etc.)

      if (words.length === 0) {
        return [new Victor(0, 0)]
      }

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
    // Reset weight to Regular if switching to a font that doesn't have the current weight
    if (changes.fancyFont) {
      const newWeights = getFontWeights(changes.fancyFont)

      if (newWeights && !newWeights.includes(layer.fancyFontWeight)) {
        changes.fancyFontWeight = "Regular"
      } else if (!newWeights) {
        changes.fancyFontWeight = "Regular"
      }
    }

    if (
      changes.fancyText !== undefined ||
      changes.fancyFont ||
      changes.fancyFontWeight ||
      changes.fancyLineSpacing
    ) {
      const newFontName = changes.fancyFont || layer.fancyFont
      const newWeight =
        changes.fancyFontWeight || layer.fancyFontWeight || "Regular"
      const newFont = getFont(newFontName, newWeight)
      const oldFont = getFont(layer.fancyFont, layer.fancyFontWeight)

      // Skip dimension recalculation if fonts aren't loaded yet.
      // The listener middleware will trigger a re-update when the font loads.
      if (!newFont || !oldFont) {
        return
      }

      // default "a" value handles the empty string case to prevent weird resizing
      const newProps = {
        ...layer,
        fancyText: changes.fancyText || layer.fancyText || "a",
        fancyFont: newFontName,
        fancyFontWeight: newWeight,
      }
      const oldProps = {
        ...layer,
        fancyText: layer.fancyText || "a",
      }
      const oldVertices = this.getVertices({ shape: oldProps, creating: true })
      const vertices = this.getVertices({ shape: newProps, creating: true })
      const { width: oldWidth, height: oldHeight } = dimensions(oldVertices)
      const { width, height } = dimensions(vertices)

      changes.width =
        oldWidth === 0 ? this.startingWidth : (layer.width * width) / oldWidth
      changes.height =
        oldHeight == 0
          ? this.startingHeight
          : (layer.height * height) / oldHeight
      changes.aspectRatio = changes.width / changes.height
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

        if (state.shape.fancyConnectLines === "outside") {
          // mark last vertex; we will connect along the machine perimeter
          const prev = prevVertices[prevVertices.length - 1]

          prev.connector = true
          prev.hidden = true
        } else {
          // Find vertical boundaries for mid-point calculation
          const lowest =
            prevVertices[findMinimumVertex(null, prevVertices, (val, v) => v.y)]
          const highest =
            currVertices[
              findMinimumVertex(null, currVertices, (val, v) => -v.y)
            ]
          const midY = lowest.y - (lowest.y - highest.y) / 2

          // Connect from end of previous row to start of current row via horizontal line
          const prev = prevVertices[prevVertices.length - 1]
          const next = currVertices[0]

          // Draw horizontal connector at midY between where prev row ends and next row starts
          newVertices.push(new Victor(prev.x, midY))
          newVertices.push(new Victor(next.x, midY))
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
    if (word.length === 0) {
      return []
    }

    // Use Array.from to properly handle Unicode (emoji are multi-byte)
    const chars = Array.from(word)
    const fSize = FONT_SIZE
    const charCircuits = []
    let xOffset = 0

    // First pass: collect all character circuits with their positions
    for (const char of chars) {
      const charPaths = this.convertTextToPoints(char, font)
      const glyph = font.charToGlyph(char)
      const advanceWidth = ((glyph.advanceWidth || 0) / font.unitsPerEm) * fSize

      if (charPaths.length === 0) {
        xOffset += advanceWidth
        continue
      }

      // Offset paths by current x position
      const offsetPaths = charPaths.map((path) =>
        path.map((pt) => new Victor(pt.x + xOffset, pt.y)),
      )

      // Run Chinese Postman on this character's paths
      const charVertices = this.connectPathsWithChinesePostman(offsetPaths)

      if (charVertices.length > 0) {
        charCircuits.push(charVertices)
      }

      xOffset += advanceWidth
    }

    if (charCircuits.length === 0) {
      return []
    }

    // Second pass: connect circuits with optimal connection points
    let allVertices = []
    const connectMode = state.shape.fancyConnectLines

    for (let c = 0; c < charCircuits.length; c++) {
      const { loop, isClosed } = this.getOpenLoop(charCircuits[c])

      if (c === 0) {
        // First character: rotate to start at predictable position for row connections
        const startIdx = this.findStartIndex(loop, connectMode)
        const rotated = this.rotateLoop(loop, startIdx, isClosed)

        allVertices.push(...rotated)
        charCircuits[c] = rotated
      } else {
        // Find optimal connection between previous and current character
        const { loop: prevLoop } = this.getOpenLoop(charCircuits[c - 1])
        const { idx1: bestPrevIdx, idx2: bestCurrIdx } = this.findClosestPair(
          prevLoop,
          loop,
        )

        // Backtrack previous character to optimal end point
        const prevEndIdx = prevLoop.length - 1

        if (bestPrevIdx !== prevEndIdx) {
          const backtrack = this.shortestPathAroundLoop(
            prevEndIdx,
            bestPrevIdx,
            prevLoop,
          )

          allVertices.push(...backtrack.slice(1))
        }

        // Rotate current circuit to start at optimal point
        const rotated = this.rotateLoop(loop, bestCurrIdx, isClosed)

        allVertices.push(...rotated)
        charCircuits[c] = rotated
      }
    }

    // Last character: backtrack to end at predictable position for row connections
    if (charCircuits.length > 0) {
      const { loop: lastLoop } = this.getOpenLoop(
        charCircuits[charCircuits.length - 1],
      )
      const endIdx = this.findEndIndex(lastLoop, connectMode)
      const currentEndIdx = lastLoop.length - 1

      if (endIdx !== currentEndIdx) {
        const backtrack = this.shortestPathAroundLoop(
          currentEndIdx,
          endIdx,
          lastLoop,
        )

        allVertices.push(...backtrack.slice(1))
      }
    }

    return allVertices
  }

  // Extract the open loop from a circuit (removing duplicate endpoint if closed)
  getOpenLoop(circuit) {
    if (circuit.length < 2) {
      return { loop: circuit, isClosed: false }
    }

    const first = circuit[0]
    const last = circuit[circuit.length - 1]
    const isClosed = distance(first, last) < TOLERANCE
    const loop = isClosed ? circuit.slice(0, -1) : circuit

    return { loop, isClosed }
  }

  // Rotate a loop to start at given index, optionally re-closing it
  rotateLoop(loop, startIdx, isClosed) {
    const rotated = [...loop.slice(startIdx), ...loop.slice(0, startIdx)]

    if (isClosed && rotated.length > 0) {
      rotated.push(cloneVertex(rotated[0]))
    }

    return rotated
  }

  // Find index of extreme point in loop based on connect mode
  findStartIndex(loop, connectMode) {
    if (connectMode === "outside") {
      // Leftmost point
      return loop.reduce(
        (minIdx, pt, i) => (pt.x < loop[minIdx].x ? i : minIdx),
        0,
      )
    } else {
      // Topmost point (highest y)
      return loop.reduce(
        (maxIdx, pt, i) => (pt.y > loop[maxIdx].y ? i : maxIdx),
        0,
      )
    }
  }

  // Find index of extreme point for ending based on connect mode
  findEndIndex(loop, connectMode) {
    if (connectMode === "outside") {
      // Rightmost point
      return loop.reduce(
        (maxIdx, pt, i) => (pt.x > loop[maxIdx].x ? i : maxIdx),
        0,
      )
    } else {
      // Bottommost point (lowest y)
      return loop.reduce(
        (minIdx, pt, i) => (pt.y < loop[minIdx].y ? i : minIdx),
        0,
      )
    }
  }

  // Find the closest pair of points between two loops
  findClosestPair(loop1, loop2) {
    let bestIdx1 = 0
    let bestIdx2 = 0
    let bestDist = Infinity

    for (let i = 0; i < loop1.length; i++) {
      for (let j = 0; j < loop2.length; j++) {
        const dist = distance(loop1[i], loop2[j])

        if (dist < bestDist) {
          bestDist = dist
          bestIdx1 = i
          bestIdx2 = j
        }
      }
    }

    return { idx1: bestIdx1, idx2: bestIdx2, dist: bestDist }
  }

  // Given a loop of points, returns the shortest path from start index to end index
  shortestPathAroundLoop(start, end, loop) {
    if (start === end) {
      return [loop[start]]
    }

    if (start > end) {
      if (Math.abs(start - end) > loop.length / 2) {
        // go the other way around
        return loop.slice(start, loop.length).concat(loop.slice(0, end + 1))
      } else {
        return loop.slice(end, start + 1).reverse()
      }
    } else {
      if (Math.abs(start - end) > loop.length / 2) {
        // go the other way around
        return loop
          .slice(end, loop.length)
          .concat(loop.slice(0, start + 1))
          .reverse()
      } else {
        return loop.slice(start, end + 1)
      }
    }
  }

  // renders text using an OpenType font and converts it to points we can draw
  convertTextToPoints(text, font) {
    // these values produce fluid text curves at different sizes
    const tolerance = 0.001
    const distance = 0.001
    const fSize = FONT_SIZE
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

  // Nodes within tolerance share the same key for graph merging
  proximityNode(x, y, tolerance = TOLERANCE) {
    const sx = Math.round(x / tolerance) * tolerance
    const sy = Math.round(y / tolerance) * tolerance
    const key = `${sx.toFixed(4)},${sy.toFixed(4)}`

    return { x, y, toString: () => key }
  }

  // Build graph from all letter paths for Chinese Postman traversal
  buildPathGraph(paths, tolerance = TOLERANCE) {
    const graph = new Graph()

    for (const path of paths) {
      if (path.length < 2) continue

      // Add nodes for all vertices
      for (const pt of path) {
        graph.addNode(this.proximityNode(pt.x, pt.y, tolerance))
      }

      // Add edges for consecutive vertices
      for (let i = 0; i < path.length - 1; i++) {
        const pt1 = path[i]
        const pt2 = path[i + 1]
        const node1 = this.proximityNode(pt1.x, pt1.y, tolerance)
        const node2 = this.proximityNode(pt2.x, pt2.y, tolerance)

        if (node1.toString() !== node2.toString()) {
          graph.addEdge(node1, node2)
        }
      }
    }

    return graph
  }

  // Use Chinese Postman algorithm to find optimal path through all letter paths
  connectPathsWithChinesePostman(paths) {
    if (paths.length === 0) return []
    if (paths.length === 1 && paths[0].length > 0) {
      return paths[0].map((v) => cloneVertex(v))
    }

    const graph = this.buildPathGraph(paths, TOLERANCE)

    // Connect disconnected components with minimal bridges
    graph.connectComponents()

    const edges = Object.values(graph.edgeMap)

    if (edges.length === 0) {
      return paths.flat().map((v) => cloneVertex(v))
    }

    const dijkstraFn = (startKey, endKey) =>
      graph.dijkstraShortestPath(startKey, endKey)
    const { edges: eulerizedEdges } = eulerizeEdges(
      edges,
      dijkstraFn,
      graph.nodeMap,
    )
    const trail = eulerianTrail({ edges: eulerizedEdges })
    const vertices = []

    for (const nodeKey of trail) {
      const node = graph.nodeMap[nodeKey]

      if (node) {
        // Skip duplicates
        if (vertices.length > 0) {
          const last = vertices[vertices.length - 1]
          const dist = distance(node, last)

          if (dist < TOLERANCE) continue
        }
        vertices.push(cloneVertex(node))
      }
    }

    return vertices
  }

  getOptions() {
    return options
  }

  randomChanges(layer) {
    let changes = {
      fancyFont: "Noto Emoji",
    }

    while (changes.fancyFont == "Noto Emoji") {
      changes = super.randomChanges(layer)
    }

    return changes
  }
}
