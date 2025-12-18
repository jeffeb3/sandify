import Shape from "../Shape"
import seedrandom from "seedrandom"
import Graph from "@/common/Graph"
import { eulerianTrail } from "@/common/eulerian_trail/eulerianTrail"
import { difference } from "@/common/util"
import { cloneVertices, centerOnOrigin } from "@/common/geometry"
import RectangularGrid from "./RectangularGrid"
import PolarGrid from "./PolarGrid"
import HexGrid from "./HexGrid"
import TriangleGrid from "./TriangleGrid"
import { wilson } from "./algorithms/wilson"
import { backtracker } from "./algorithms/backtracker"
import { division } from "./algorithms/division"
import { prim } from "./algorithms/prim"
import { kruskal } from "./algorithms/kruskal"
import { sidewinder } from "./algorithms/sidewinder"
import { eller } from "./algorithms/eller"

const algorithms = {
  wilson,
  backtracker,
  division,
  prim,
  kruskal,
  sidewinder,
  eller,
}

const options = {
  mazeShape: {
    title: "Shape",
    type: "togglebutton",
    choices: ["Rectangle", "Hexagon", "Triangle", "Circle"],
  },
  mazeType: {
    title: "Algorithm",
    type: "dropdown",
    choices: [
      "Wilson",
      "Backtracker",
      "Division",
      "Prim",
      "Kruskal",
      "Sidewinder",
      "Eller",
    ],
    isVisible: (layer, state) => {
      return state.mazeShape === "Rectangle"
    },
  },
  mazeTypeCircle: {
    title: "Algorithm",
    type: "dropdown",
    choices: ["Wilson", "Backtracker", "Prim", "Kruskal"],
    isVisible: (layer, state) => {
      return state.mazeShape === "Circle"
    },
  },
  mazeTypeHex: {
    title: "Algorithm",
    type: "dropdown",
    choices: ["Wilson", "Backtracker", "Prim", "Kruskal"],
    isVisible: (layer, state) => {
      return state.mazeShape === "Hexagon"
    },
  },
  mazeTypeTriangle: {
    title: "Algorithm",
    type: "dropdown",
    choices: ["Wilson", "Backtracker", "Prim", "Kruskal"],
    isVisible: (layer, state) => {
      return state.mazeShape === "Triangle"
    },
  },
  mazeWidth: {
    title: "Maze width",
    min: 1,
    max: 20,
    isVisible: (layer, state) => {
      return state.mazeShape !== "Circle"
    },
  },
  mazeHeight: {
    title: "Maze height",
    min: 1,
    max: 20,
    isVisible: (layer, state) => {
      return state.mazeShape !== "Circle"
    },
  },
  mazeRingCount: {
    title: "Rings",
    min: 2,
    max: 15,
    isVisible: (layer, state) => {
      return state.mazeShape === "Circle"
    },
  },
  mazeWedgeCount: {
    title: "Wedges",
    min: 4,
    max: 16,
    isVisible: (layer, state) => {
      return state.mazeShape === "Circle"
    },
  },
  mazeWedgeDoubling: {
    title: "Doubling interval",
    min: 1,
    max: 10,
    isVisible: (layer, state) => {
      return state.mazeShape === "Circle"
    },
  },
  mazeWallType: {
    title: "Wall type",
    type: "togglebutton",
    choices: ["Segment", "Arc"],
    isVisible: (layer, state) => {
      return state.mazeShape === "Circle"
    },
  },
  mazeStraightness: {
    title: "Straightness",
    type: "slider",
    min: 0,
    max: 10,
    step: 1,
    isVisible: (layer, state) => {
      if (state.mazeShape === "Circle") return false
      if (state.mazeShape === "Hexagon")
        return state.mazeTypeHex === "Backtracker"
      if (state.mazeShape === "Triangle")
        return state.mazeTypeTriangle === "Backtracker"

      return state.mazeType === "Backtracker" || state.mazeType === "Sidewinder"
    },
  },
  mazeHorizontalBias: {
    title: "Horizontal bias",
    type: "slider",
    min: 0,
    max: 10,
    step: 1,
    isVisible: (layer, state) => {
      return (
        state.mazeShape !== "Circle" &&
        (state.mazeType === "Division" ||
          state.mazeType === "Kruskal" ||
          state.mazeType === "Eller")
      )
    },
  },
  mazeBranchLevel: {
    title: "Branch level",
    type: "slider",
    min: 0,
    max: 10,
    step: 1,
    isVisible: (layer, state) => {
      // Works for rectangular, hex, triangle, and circular Prim
      let algo

      if (state.mazeShape === "Circle") {
        algo = state.mazeTypeCircle
      } else if (state.mazeShape === "Hexagon") {
        algo = state.mazeTypeHex
      } else if (state.mazeShape === "Triangle") {
        algo = state.mazeTypeTriangle
      } else {
        algo = state.mazeType
      }

      return algo === "Prim"
    },
  },
  seed: {
    title: "Random seed",
    min: 1,
    randomMax: 1000,
  },
}

export default class Maze extends Shape {
  constructor() {
    super("maze")
    this.label = "Maze"
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        mazeShape: "Rectangle",
        mazeType: "Wilson",
        mazeTypeCircle: "Wilson",
        mazeTypeHex: "Wilson",
        mazeTypeTriangle: "Wilson",
        mazeWidth: 8,
        mazeHeight: 8,
        mazeRingCount: 6,
        mazeWedgeCount: 8,
        mazeWedgeDoubling: 3,
        mazeWallType: "Arc",
        mazeStraightness: 0,
        mazeHorizontalBias: 5,
        mazeBranchLevel: 5,
        seed: 1,
      },
    }
  }

  getVertices(state) {
    const {
      mazeShape,
      mazeType,
      mazeTypeCircle,
      mazeTypeHex,
      mazeTypeTriangle,
      mazeStraightness,
      mazeHorizontalBias,
      mazeBranchLevel,
      seed,
    } = state.shape

    const rng = seedrandom(seed)
    const grid = this.createGrid(state.shape, rng)
    let algorithmName

    if (mazeShape === "Circle") {
      algorithmName = mazeTypeCircle
    } else if (mazeShape === "Hexagon") {
      algorithmName = mazeTypeHex
    } else if (mazeShape === "Triangle") {
      algorithmName = mazeTypeTriangle
    } else {
      algorithmName = mazeType
    }

    const algorithm = algorithms[algorithmName.toLowerCase()]

    algorithm(grid, {
      rng,
      straightness: mazeStraightness,
      horizontalBias: mazeHorizontalBias,
      branchLevel: mazeBranchLevel,
    })

    return this.drawMaze(grid)
  }

  createGrid(shape, rng) {
    const {
      mazeShape,
      mazeWidth,
      mazeHeight,
      mazeRingCount,
      mazeWedgeCount,
      mazeWedgeDoubling,
      mazeWallType,
    } = shape

    if (mazeShape === "Circle") {
      return new PolarGrid(
        Math.max(2, mazeRingCount),
        Math.max(4, mazeWedgeCount),
        Math.max(1, mazeWedgeDoubling),
        rng,
        mazeWallType === "Arc",
      )
    }

    const width = Math.max(2, mazeWidth)
    const height = Math.max(2, mazeHeight)

    if (mazeShape === "Hexagon") {
      return new HexGrid(width, height, rng)
    }

    if (mazeShape === "Triangle") {
      return new TriangleGrid(width, height, rng)
    }

    return new RectangularGrid(width, height, rng)
  }

  drawMaze(grid) {
    const wallSegments = grid.extractWalls()
    const graph = new Graph()

    wallSegments.forEach(([v1, v2]) => {
      graph.addNode(v1)
      graph.addNode(v2)
      graph.addEdge(v1, v2)
    })

    // Calculate Eulerian trail and track which edges we walk
    const trail = eulerianTrail({ edges: Object.values(graph.edgeMap) })
    const walkedEdges = new Set(
      trail.slice(0, -1).map((key, i) => [key, trail[i + 1]].sort().toString()),
    )
    const missingEdges = {}

    for (const edgeStr of difference(walkedEdges, graph.edgeKeys)) {
      const [x1, y1, x2, y2] = edgeStr.split(",")
      missingEdges[`${x1},${y1}`] = `${x2},${y2}`
    }

    // Walk the trail, filling gaps with Dijkstra shortest paths
    const walkedVertices = []
    let prevKey

    trail.forEach((key) => {
      const vertex = graph.nodeMap[key]

      if (prevKey) {
        if (!graph.hasEdge(key, prevKey)) {
          const path = graph.dijkstraShortestPath(prevKey, key)

          path.shift()
          walkedVertices.push(...path, vertex)
        } else {
          walkedVertices.push(vertex)
        }
      } else {
        walkedVertices.push(vertex)
      }

      // Add back any missing edges
      if (missingEdges[key]) {
        const missingVertex = graph.nodeMap[missingEdges[key]]
        const edgeKey = [key, missingEdges[key]].sort().toString()

        if (graph.edgeMap[edgeKey]) {
          walkedVertices.push(missingVertex, vertex)
        }

        delete missingEdges[key]
      }

      prevKey = key
    })

    const vertices = cloneVertices(walkedVertices)

    centerOnOrigin(vertices)

    return vertices
  }

  getOptions() {
    return options
  }
}
