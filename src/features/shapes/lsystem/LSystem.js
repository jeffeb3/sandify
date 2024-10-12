import Shape from "../Shape"
import {
  lsystem,
  lsystemPath,
  onSubtypeChange,
  onMinIterations,
  onMaxIterations,
} from "@/common/lindenmayer"
import { subtypes } from "./subtypes"
import { resizeVertices, cloneVertices } from "@/common/geometry"
import { buildGraph, edgeKey } from "@/common/Graph"

const options = {
  subtype: {
    title: "Type",
    type: "dropdown",
    choices: Object.keys(subtypes),
    onChange: (model, changes, state) => {
      return onSubtypeChange(subtypes[changes.subtype], changes, state)
    },
  },
  iterations: {
    title: "Iterations",
    min: (state) => {
      return onMinIterations(subtypes[state.subtype], state)
    },
    max: (state) => {
      return onMaxIterations(subtypes[state.subtype], state)
    },
  },
}

export default class LSystem extends Shape {
  constructor() {
    super("lsystem")
    this.label = "Fractal line writer"
    this.link = "https://en.wikipedia.org/wiki/L-system"
    this.linkText = "Wikipedia"
    this.description =
      "The fractal line writer shape is a Lindenmayer (or L) system. L-systems chain symbols together to specify instructions for moving in a 2d space (e.g., turn left or right, walk left or right). When applied recursively, they generate fractal-like patterns."
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        iterations: 3,
        subtype: "McWorter's Pentadendrite",
      },
    }
  }

  getVertices(state) {
    const shape = state.shape
    const iterations = shape.iterations || 1

    // generate our vertices using a set of l-system rules
    let config = subtypes[shape.subtype]

    config.iterations = iterations
    config.side = 5

    if (config.angle === undefined) {
      config.angle = Math.PI / 2
    }

    const curve = lsystemPath(lsystem(config), config)
    const scale = 18.0 // to normalize starting size
    const path =
      config.shortestPath >= iterations ? this.shortestPath(curve) : curve

    return resizeVertices(path, scale, scale)
  }

  getOptions() {
    return options
  }

  shortestPath(nodes) {
    const graph = buildGraph(nodes)
    const path = []
    const visited = {}

    for (let i = 0; i < nodes.length - 1; i++) {
      const node1 = nodes[i]
      const node2 = nodes[i + 1]
      let node1Key = node1.toString()
      let edge12Key = edgeKey(node1, node2)

      if (visited[edge12Key]) {
        const unvisitedNode = this.nearestUnvisitedNode(
          i + 1,
          nodes,
          visited,
          graph,
        )

        if (unvisitedNode != null) {
          const shortestSubPath = graph.dijkstraShortestPath(
            node1Key,
            unvisitedNode.toString(),
          )

          path.push(...cloneVertices(shortestSubPath.slice(1)))
          i = nodes.indexOf(unvisitedNode) - 1
        }
      } else {
        path.push(node2)
        visited[edge12Key] = true
      }
    }

    return path
  }

  nearestUnvisitedNode(nodeIndex, nodes, visited, graph) {
    for (let i = nodeIndex; i < nodes.length - 1; i++) {
      const node1 = nodes[i]
      const node2 = nodes[i + 1]

      if (!visited[edgeKey(node1, node2)]) {
        return node2
      }
    }

    return null // all nodes visited
  }
}
