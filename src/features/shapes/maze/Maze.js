/* global console */
import Shape from "../Shape"
import seedrandom from "seedrandom"
import Graph from "@/common/Graph"
import { eulerianTrail } from "@/common/eulerian_trail/eulerianTrail"
import { eulerizeEdges } from "@/common/chinesePostman"
import {
  cloneVertices,
  centerOnOrigin,
  closestPointOnSegments,
} from "@/common/geometry"
import RectangularGrid from "./grids/RectangularGrid"
import PolarGrid from "./grids/PolarGrid"
import HexGrid from "./grids/HexGrid"
import TriangleGrid from "./grids/TriangleGrid"
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

// Set to true to debug maze generation
const DEBUG_MAZE = false

const algorithmKeyByShape = {
  Rectangle: "mazeType",
  Circle: "mazeTypeCircle",
  Hexagon: "mazeTypeHex",
  Triangle: "mazeTypeTriangle",
}

const getAlgorithm = (state) => state[algorithmKeyByShape[state.mazeShape]]

const gridByShape = {
  Rectangle: RectangularGrid,
  Hexagon: HexGrid,
  Triangle: TriangleGrid,
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
      const algo = getAlgorithm(state)

      return algo === "Backtracker" || algo === "Sidewinder"
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
      return getAlgorithm(state) === "Prim"
    },
  },
  mazeShowExits: {
    title: "Show entry/exit",
    type: "checkbox",
  },
  mazeShowSolution: {
    title: "Show solution",
    type: "checkbox",
    isVisible: (layer, state) => {
      return state.mazeShowExits
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
        mazeShowExits: true,
        mazeShowSolution: false,
        seed: 1,
      },
    }
  }

  getVertices(state) {
    const {
      mazeStraightness,
      mazeHorizontalBias,
      mazeBranchLevel,
      mazeShowExits,
      mazeShowSolution,
      seed,
    } = state.shape

    const rng = seedrandom(seed)
    const grid = this.createGrid(state.shape, rng)
    const algorithmName = getAlgorithm(state.shape)
    const algorithm = algorithms[algorithmName.toLowerCase()]

    algorithm(grid, {
      rng,
      straightness: mazeStraightness,
      horizontalBias: mazeHorizontalBias,
      branchLevel: mazeBranchLevel,
    })

    let solutionPath = null

    if (mazeShowExits && grid.findHardestExits) {
      const exits = grid.findHardestExits()

      if (exits) {
        exits.startCell.exitType = "entrance"
        exits.endCell.exitType = "exit"

        if (mazeShowSolution && exits.path) {
          solutionPath = exits.path
        }
      }
    }

    if (DEBUG_MAZE && grid.dump) {
      console.log(`\n=== ${algorithmName} on ${state.shape.mazeShape} ===`)
      grid.dump()
    }

    return this.drawMaze(grid, solutionPath)
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

    const GridClass = gridByShape[mazeShape]

    return new GridClass(Math.max(2, mazeWidth), Math.max(2, mazeHeight), rng)
  }

  drawMaze(grid, solutionPath = null) {
    const wallSegments = grid.extractWalls()
    const graph = new Graph()

    wallSegments.forEach(([v1, v2]) => {
      graph.addNode(v1)
      graph.addNode(v2)
      graph.addEdge(v1, v2)
    })

    const edges = Object.values(graph.edgeMap)
    const dijkstraFn = (startKey, endKey) => {
      return graph.dijkstraShortestPath(startKey, endKey)
    }
    const { edges: eulerizedEdges } = eulerizeEdges(
      edges,
      dijkstraFn,
      graph.nodeMap,
    )
    const trail = eulerianTrail({ edges: eulerizedEdges })
    const walkedVertices = trail.map((key) => graph.nodeMap[key])

    if (solutionPath && solutionPath.length > 0) {
      this.drawSolution(walkedVertices, graph, trail, grid, solutionPath)
    }

    const vertices = cloneVertices(walkedVertices)

    centerOnOrigin(vertices)

    return vertices
  }

  drawSolution(walkedVertices, graph, trail, grid, solutionPath) {
    const startCell = solutionPath[0]
    const endCell = solutionPath[solutionPath.length - 1]

    if (!startCell.arrowEdges || !endCell.arrowEdges) {
      return
    }

    const secondCenter = solutionPath.length > 1
      ? grid.getCellCenter(solutionPath[1])
      : grid.getCellCenter(solutionPath[0])
    const secondToLastCenter = solutionPath.length > 1
      ? grid.getCellCenter(solutionPath[solutionPath.length - 2])
      : grid.getCellCenter(solutionPath[0])
    const entrance = closestPointOnSegments(secondCenter, startCell.arrowEdges)
    const [entA, entB] = entrance.segment
    const distToA =
      (entrance.point.x - entA.x) ** 2 + (entrance.point.y - entA.y) ** 2
    const distToB =
      (entrance.point.x - entB.x) ** 2 + (entrance.point.y - entB.y) ** 2
    const entranceVertex = distToA < distToB ? entA : entB
    const entranceKey = entranceVertex.toString()
    const trailEndKey = trail[trail.length - 1]

    if (graph.nodeMap[entranceKey]) {
      const pathKeys = graph.dijkstraShortestPath(trailEndKey, entranceKey)

      if (pathKeys && pathKeys.length > 1) {
        for (let i = 1; i < pathKeys.length; i++) {
          walkedVertices.push(graph.nodeMap[pathKeys[i]])
        }
      }
    }

    walkedVertices.push(entrance.point)

    for (let i = 1; i < solutionPath.length - 1; i++) {
      const center = grid.getCellCenter(solutionPath[i])

      walkedVertices.push({ x: center.x, y: center.y })
    }

    const exit = closestPointOnSegments(secondToLastCenter, endCell.arrowEdges)
    const [exitA, exitB] = exit.segment
    const distToExitA =
      (exit.point.x - exitA.x) ** 2 + (exit.point.y - exitA.y) ** 2
    const distToExitB =
      (exit.point.x - exitB.x) ** 2 + (exit.point.y - exitB.y) ** 2
    const exitVertex = distToExitA < distToExitB ? exitA : exitB

    walkedVertices.push(exitVertex)
    walkedVertices.push(exit.point)
  }

  getOptions() {
    return options
  }
}
