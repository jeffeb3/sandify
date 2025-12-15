import Victor from "victor"
import Shape from "../Shape"
import seedrandom from "seedrandom"
import Graph from "@/common/Graph"
import { eulerianTrail } from "@/common/eulerian_trail/eulerianTrail"
import { difference } from "@/common/util"
import { cloneVertices, centerOnOrigin } from "@/common/geometry"
import { wilson } from "./algorithms/wilson"
import { backtracker } from "./algorithms/backtracker"
import { division } from "./algorithms/division"
import { prim } from "./algorithms/prim"
import { kruskal } from "./algorithms/kruskal"
import { sidewinder } from "./algorithms/sidewinder"
import { consoleDisplay } from "./algorithms/console"

const algorithms = {
  wilson,
  backtracker,
  division,
  prim,
  kruskal,
  sidewinder,
  consoleDisplay,
}
const N = 1
const S = 2
const E = 4
const W = 8
const IN = 0x10 // good for tracking visited cells
const DX = { [E]: 1, [W]: -1, [N]: 0, [S]: 0 }
const DY = { [E]: 0, [W]: 0, [N]: -1, [S]: 1 }
const OPPOSITE = { [E]: W, [W]: E, [N]: S, [S]: N }
const options = {
  mazeType: {
    title: "Algorithm",
    type: "dropdown",
    choices: ["Wilson", "Backtracker", "Division", "Prim", "Kruskal", "Sidewinder"],
  },
  mazeWidth: {
    title: "Maze width",
    min: 1,
    max: 20,
  },
  mazeHeight: {
    title: "Maze height",
    min: 1,
    max: 20,
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
        mazeType: "Wilson",
        mazeWidth: 8,
        mazeHeight: 8,
        seed: 1,
      },
    }
  }

  getVertices(state) {
    const { mazeType, mazeWidth, mazeHeight, seed } = state.shape
    const width = Math.max(2, mazeWidth)
    const height = Math.max(2, mazeHeight)

    this.setup(width, height, seed)
    this.generateMaze(mazeType, width, height)

    return this.drawMaze(width, height)
  }

  drawMaze(mazeWidth, mazeHeight) {
    const wallSegments = this.extractWallSegments(mazeWidth, mazeHeight)
    const graph = new Graph()

    wallSegments.forEach(([v1, v2]) => {
      graph.addNode(v1)
      graph.addNode(v2)
      graph.addEdge(v1, v2)
    })

    const trail = eulerianTrail({ edges: Object.values(graph.edgeMap) })
    let prevKey
    const walkedVertices = []
    const walkedEdges = new Set(
      trail.slice(0, -1).map((key, i) => [key, trail[i + 1]].sort().toString())
    )

    // find edges that weren't walked
    const missingEdges = Array.from(
      difference(walkedEdges, graph.edgeKeys),
    ).reduce((hash, d) => {
      d = d.split(",")
      hash[d[0] + "," + d[1]] = d[2] + "," + d[3]

      return hash
    }, {})

    // walk the trail, filling gaps with Dijkstra shortest paths
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

      // add back any missing edges
      if (missingEdges[key]) {
        const missingVertex = graph.nodeMap[missingEdges[key]]
        const edgeKey = [key, missingEdges[key]].sort().toString()

        if (graph.edgeMap[edgeKey]) {
          walkedVertices.push(missingVertex)
          walkedVertices.push(vertex)
        }

        delete missingEdges[key]
      }

      prevKey = key
    })

    const clonedVertices = cloneVertices(walkedVertices)

    centerOnOrigin(clonedVertices)

    return clonedVertices
  }

  extractWallSegments(width, height) {
    const walls = []

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cell = this.grid[y][x]

        // North wall (top of cell)
        if (y === 0 || !(cell & N)) {
          walls.push([
            new Victor(x, y),
            new Victor(x + 1, y),
          ])
        }

        // South wall (bottom of cell)
        if (y === height - 1 || !(cell & S)) {
          walls.push([
            new Victor(x, y + 1),
            new Victor(x + 1, y + 1),
          ])
        }

        // West wall (left of cell)
        if (x === 0 || !(cell & W)) {
          walls.push([
            new Victor(x, y),
            new Victor(x, y + 1),
          ])
        }

        // East wall (right of cell)
        if (x === width - 1 || !(cell & E)) {
          walls.push([
            new Victor(x + 1, y),
            new Victor(x + 1, y + 1),
          ])
        }
      }
    }

    return walls
  }

  setup(width, height, seed) {
    this.rng = seedrandom(seed)
    this.grid = Array(height)
      .fill(0)
      .map(() => Array(width).fill(0))

    // initialize a random starting cell
    this.grid[Math.floor(this.rng() * height)][Math.floor(this.rng() * width)] =
      IN
  }

  generateMaze(mazeType, width, height) {
    const algorithm = algorithms[mazeType.toLowerCase()] || wilson

    algorithm(this.grid, width, height, this.rng)
  }

  getOptions() {
    return options
  }
}
