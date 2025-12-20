/* global console */
import Shape from "../Shape"
import seedrandom from "seedrandom"
import Graph from "@/common/Graph"
import { eulerianTrail } from "@/common/eulerian_trail/eulerianTrail"
import { eulerizeEdges } from "@/common/chinesePostman"
import {
  cloneVertices,
  centerOnOrigin,
  catmullRomSpline,
  calculateIntersection,
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
    max: 30,
    isVisible: (layer, state) => {
      return state.mazeShape !== "Circle"
    },
  },
  mazeHeight: {
    title: "Maze height",
    min: 1,
    max: 30,
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

    const entranceTip = startCell.arrowEdges[0][0]
    const exitBaseCenter = endCell.arrowEdges[1][1]
    const entranceKey = entranceTip.toString()
    const trailEndKey = trail[trail.length - 1]

    if (graph.nodeMap[entranceKey]) {
      const pathKeys = graph.dijkstraShortestPath(trailEndKey, entranceKey)

      if (pathKeys && pathKeys.length > 1) {
        for (let i = 1; i < pathKeys.length; i++) {
          walkedVertices.push(graph.nodeMap[pathKeys[i]])
        }
      }
    }

    // Collect passage midpoints (shared edge centers between consecutive cells)
    const passageMidpoints = []

    for (let i = 0; i < solutionPath.length - 1; i++) {
      const midpoint = grid.getSharedEdgeMidpoint(
        solutionPath[i],
        solutionPath[i + 1],
      )

      passageMidpoints.push(midpoint)
    }

    // Build path using only passage midpoints (doorways between cells)
    const solutionWaypoints = [entranceTip, ...passageMidpoints, exitBaseCenter]

    // Apply spline smoothing, then clip at arrow edges
    let smoothed = catmullRomSpline(solutionWaypoints, 6)

    // Clip at entrance arrow and walk from tip to intersection
    const entrance = this.clipAtArrow(smoothed, startCell.arrowEdges, true)

    if (entrance.hit) {
      smoothed = [
        ...this.walkArrowToTip(entrance.edgeIndex, startCell.arrowEdges, true),
        entrance.hit,
        ...entrance.spline,
      ]
    }

    // Clip at exit arrow and walk from intersection to tip
    const exit = this.clipAtArrow(smoothed, endCell.arrowEdges, false)
    const exitTip = endCell.arrowEdges[0][0]

    if (exit.hit) {
      smoothed = [
        ...exit.spline,
        exit.hit,
        ...this.walkArrowToTip(exit.edgeIndex, endCell.arrowEdges, false),
      ]
    } else {
      // No intersection - walk arrow edge: baseCenter → baseRight → tip
      const baseRight = endCell.arrowEdges[2][1]

      smoothed.push(baseRight)
      smoothed.push(exitTip)
    }

    for (const pt of smoothed) {
      walkedVertices.push(pt)
    }
  }

  // Clip spline where it crosses an arrow edge
  // Returns { spline, hit, edgeIndex }
  clipAtArrow(spline, arrowEdges, fromStart) {
    if (fromStart) {
      for (let i = 0; i < spline.length - 1; i++) {
        for (let e = 0; e < arrowEdges.length; e++) {
          const [a, b] = arrowEdges[e]
          const hit = calculateIntersection(spline[i], spline[i + 1], a, b)

          if (hit) {
            return { spline: spline.slice(i + 1), hit, edgeIndex: e }
          }
        }
      }
    } else {
      for (let i = spline.length - 1; i > 0; i--) {
        for (let e = 0; e < arrowEdges.length; e++) {
          const [a, b] = arrowEdges[e]
          const hit = calculateIntersection(spline[i - 1], spline[i], a, b)

          if (hit) {
            return { spline: spline.slice(0, i), hit, edgeIndex: e }
          }
        }
      }
    }

    return { spline, hit: null, edgeIndex: -1 }
  }

  // Walk arrow edges from intersection to tip (or tip to intersection)
  // Arrow edges: [tip→baseLeft, baseLeft→baseCenter, baseCenter→baseRight, baseRight→tip]
  // Tip is at edges[0][0] (start of first edge)
  walkArrowToTip(edgeIndex, arrowEdges, towardsTip) {
    if (edgeIndex < 0) return []

    const tip = arrowEdges[0][0]
    const baseLeft = arrowEdges[0][1]
    const baseRight = arrowEdges[3][0]

    // Which side of the arrow did we hit?
    // edges 0,1 are left side (tip→baseLeft→baseCenter)
    // edges 2,3 are right side (baseCenter→baseRight→tip)
    if (towardsTip) {
      // Walking TO the tip (prepend to path)
      if (edgeIndex <= 1) {
        return edgeIndex === 0 ? [tip] : [tip, baseLeft]
      } else {
        return edgeIndex === 3 ? [tip] : [tip, baseRight]
      }
    } else {
      // Walking FROM the tip (append to path)
      if (edgeIndex <= 1) {
        return edgeIndex === 0 ? [tip] : [baseLeft, tip]
      } else {
        return edgeIndex === 3 ? [tip] : [baseRight, tip]
      }
    }
  }

  getOptions() {
    return options
  }
}
