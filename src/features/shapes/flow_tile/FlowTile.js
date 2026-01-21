import Victor from "victor"
import seedrandom from "seedrandom"
import Shape from "../Shape"
import Graph, { getEulerianTrail } from "@/common/Graph"
import { centerOnOrigin } from "@/common/geometry"
import noisejs from "@/common/noise"
import { tileBounds } from "./geometry"
import { tileRenderers } from "./tileRenderers"

const options = {
  tileWidth: {
    title: "Tile width",
    min: 1,
    max: (state) => (state.tileStrokeWidth > 0 ? 18 : 50),
    step: 1,
  },
  tileHeight: {
    title: "Tile height",
    min: 1,
    max: (state) => (state.tileStrokeWidth > 0 ? 18 : 50),
    step: 1,
  },
  tileStyle: {
    title: "Style",
    type: "togglebutton",
    choices: ["Arc", "Diagonal"],
  },
  tileNoise: {
    title: "Noise",
    type: "togglebutton",
    choices: ["Random", "Perlin", "Simplex"],
  },
  tileNoiseScale: {
    title: "Noise scale",
    min: 0.05,
    max: 1.0,
    step: 0.05,
    isVisible: (layer, state) => {
      return state.tileNoise === "Perlin" || state.tileNoise === "Simplex"
    },
  },
  tileStrokeWidth: {
    title: "Stroke width",
    min: 0,
    max: 5,
    step: 1,
  },
  tileBorder: {
    title: "Show tile borders",
    type: "checkbox",
  },
  seed: {
    title: "Seed",
    min: 1,
    randomMax: 1000,
  },
}

export default class FlowTile extends Shape {
  constructor() {
    super("flowTile")

    this.label = "Flow tile"
    this.description =
      "Flow tiles are a form of Truchet tiling, named after Sébastien Truchet who first documented them in 1704. Each square tile has two possible orientations. When placed on a grid, adjacent tiles connect to form continuous flowing paths or maze-like patterns."
    this.link = "https://en.wikipedia.org/wiki/Truchet_tiles"
    this.linkText = "Wikipedia"
    this.stretch = true
  }

  initialDimensions(props) {
    return this.scaledToMachine(props, 0.6)
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        tileType: "flowTile",
        tileWidth: 5,
        tileHeight: 5,
        tileStyle: "Arc",
        tileNoise: "Random",
        tileNoiseScale: 0.2,
        tileStrokeWidth: 0,
        tileBorder: true,
        seed: 1,
      },
    }
  }

  getOptions() {
    return options
  }

  handleUpdate(layer, changes) {
    if (
      changes.tileWidth !== undefined &&
      changes.tileWidth !== layer.tileWidth
    ) {
      const scale = changes.tileWidth / layer.tileWidth
      changes.width = layer.width * scale
    }

    if (
      changes.tileHeight !== undefined &&
      changes.tileHeight !== layer.tileHeight
    ) {
      const scale = changes.tileHeight / layer.tileHeight
      changes.height = layer.height * scale
    }
  }

  getVertices(state) {
    const {
      tileWidth,
      tileHeight,
      tileStyle,
      tileNoise,
      tileNoiseScale,
      tileStrokeWidth,
      seed,
    } = state.shape

    if (tileNoise === "Perlin" || tileNoise === "Simplex") {
      noisejs.seed(seed)
    }

    const strokeScale = tileStyle === "Arc" ? 0.125 : 0.15
    const strokeWidth = tileStrokeWidth * strokeScale
    const paths = [
      ...this.drawTiles(state.shape, strokeWidth),
      ...this.drawOuterBorder(tileWidth, tileHeight),
    ]
    const vertices = this.connectPaths(paths, strokeWidth)

    centerOnOrigin(vertices)

    return vertices
  }

  drawTiles(shape, strokeWidth) {
    const {
      tileWidth,
      tileHeight,
      tileStyle,
      tileNoise,
      tileNoiseScale,
      tileBorder,
      seed,
    } = shape

    const paths = []

    for (let row = 0; row < tileHeight; row++) {
      for (let col = 0; col < tileWidth; col++) {
        const cx = col * 2
        const cy = row * 2
        const orientation = this.getOrientation(
          col,
          row,
          tileNoise,
          tileNoiseScale,
          seed,
        )
        const tilePaths = this.drawTile(
          cx,
          cy,
          tileStyle,
          strokeWidth,
          tileBorder,
          orientation,
        )
        paths.push(...tilePaths)
      }
    }

    return paths
  }

  drawOuterBorder(tileWidth, tileHeight) {
    const left = -1
    const right = tileWidth * 2 - 1
    const top = -1
    const bottom = tileHeight * 2 - 1

    const segments = []

    // Split each border segment at the tile edge midpoint
    // so tile endpoints on the border are connected
    for (let col = 0; col < tileWidth; col++) {
      const x1 = col * 2 - 1
      const xMid = col * 2
      const x2 = (col + 1) * 2 - 1
      segments.push([new Victor(x1, top), new Victor(xMid, top)])
      segments.push([new Victor(xMid, top), new Victor(x2, top)])
    }

    for (let row = 0; row < tileHeight; row++) {
      const y1 = row * 2 - 1
      const yMid = row * 2
      const y2 = (row + 1) * 2 - 1
      segments.push([new Victor(right, y1), new Victor(right, yMid)])
      segments.push([new Victor(right, yMid), new Victor(right, y2)])
    }

    for (let col = tileWidth; col > 0; col--) {
      const x1 = col * 2 - 1
      const xMid = (col - 1) * 2
      const x2 = (col - 1) * 2 - 1
      segments.push([new Victor(x1, bottom), new Victor(xMid, bottom)])
      segments.push([new Victor(xMid, bottom), new Victor(x2, bottom)])
    }

    for (let row = tileHeight; row > 0; row--) {
      const y1 = row * 2 - 1
      const yMid = (row - 1) * 2
      const y2 = (row - 1) * 2 - 1
      segments.push([new Victor(left, y1), new Victor(left, yMid)])
      segments.push([new Victor(left, yMid), new Victor(left, y2)])
    }

    return segments
  }

  getOrientation(col, row, tileNoise, tileNoiseScale, seed) {
    if (tileNoise === "Perlin") {
      const noiseVal = noisejs.perlin2(
        col * tileNoiseScale,
        row * tileNoiseScale,
      )
      return noiseVal > 0 ? 0 : 1
    } else if (tileNoise === "Simplex") {
      const noiseVal = noisejs.simplex2(
        col * tileNoiseScale,
        row * tileNoiseScale,
      )
      return noiseVal > 0 ? 0 : 1
    } else {
      const rng = seedrandom(`${seed}-${col}-${row}`)
      return rng() < 0.5 ? 0 : 1
    }
  }

  drawTile(cx, cy, tileStyle, strokeWidth, showBorder, orientation) {
    const bounds = tileBounds(cx, cy)
    return tileRenderers[tileStyle](bounds, orientation, strokeWidth, showBorder)
  }

  connectPaths(paths, strokeWidth = 0) {
    if (paths.length === 0) return []
    if (paths.length === 1) return paths[0]

    const bounds = this.getBounds(paths)
    const pathSegments = new Map()
    const graph = this.buildGraphFromPaths(paths, strokeWidth, pathSegments)
    const routingGraph = this.buildRoutingGraph(graph, pathSegments)

    this.addPerimeterRouting(routingGraph, pathSegments, bounds)
    this.updateBorderWeights(routingGraph, bounds)
    graph.connectComponents()

    const trail = getEulerianTrail(graph)

    return this.expandTrail(trail, pathSegments, routingGraph, graph)
  }

  buildGraphFromPaths(paths, strokeWidth, pathSegments) {
    const graph = new Graph()

    for (const path of paths) {
      const isLongPath = path.length > 3
      const splitAtMidpoint = isLongPath && strokeWidth === 0

      if (splitAtMidpoint) {
        // Split arc at midpoint so Eulerian trail can route through tile centers
        const midIdx = Math.floor(path.length / 2)
        const startNode = this.vertexToNode(path[0])
        const midNode = this.vertexToNode(path[midIdx])
        const endNode = this.vertexToNode(path[path.length - 1])

        graph.addNode(startNode)
        graph.addNode(midNode)
        graph.addNode(endNode)
        graph.addEdge(startNode, midNode, this.edgeWeight(path[0], path[midIdx]))
        graph.addEdge(midNode, endNode, this.edgeWeight(path[midIdx], path[path.length - 1]))

        this.storeSegment(pathSegments, startNode, midNode, path.slice(0, midIdx + 1))
        this.storeSegment(pathSegments, midNode, endNode, path.slice(midIdx))
      } else if (isLongPath) {
        // Long path with stroke: endpoints only (avoids inner/outer ribbon crossings)
        const startNode = this.vertexToNode(path[0])
        const endNode = this.vertexToNode(path[path.length - 1])

        graph.addNode(startNode)
        graph.addNode(endNode)
        graph.addEdge(startNode, endNode, this.edgeWeight(path[0], path[path.length - 1]))

        this.storeSegment(pathSegments, startNode, endNode, path)
      } else {
        // Short paths (borders): add every vertex for fine-grained routing
        for (const v of path) {
          graph.addNode(this.vertexToNode(v))
        }

        for (let i = 0; i < path.length - 1; i++) {
          const node1 = this.vertexToNode(path[i])
          const node2 = this.vertexToNode(path[i + 1])

          graph.addEdge(node1, node2, this.edgeWeight(path[i], path[i + 1]))

          const segKey = [node1.toString(), node2.toString()].sort().toString()

          if (!pathSegments.has(segKey)) {
            pathSegments.set(segKey, {
              vertices: [path[i], path[i + 1]],
              needsReverse: node1.toString() > node2.toString(),
            })
          }
        }
      }
    }

    return graph
  }

  storeSegment(pathSegments, node1, node2, vertices) {
    const key = [node1.toString(), node2.toString()].sort().toString()

    pathSegments.set(key, {
      vertices,
      needsReverse: node1.toString() > node2.toString(),
    })
  }

  // Prefer border edges (axis-aligned) over diagonal shortcuts
  edgeWeight(v1, v2) {
    const isAxisAligned = v1.x === v2.x || v1.y === v2.y

    return isAxisAligned ? 0.01 : 1
  }

  // Separate graph for finding alternative routes when trail has gaps
  buildRoutingGraph(graph, pathSegments) {
    const routingGraph = new Graph()

    for (const [edgeKey] of pathSegments) {
      const [key1, key2] = this.parseEdgeKey(edgeKey)
      const node1 = graph.nodeMap[key1]
      const node2 = graph.nodeMap[key2]

      if (node1 && node2) {
        routingGraph.addNode(node1)
        routingGraph.addNode(node2)
        routingGraph.addEdge(node1, node2, this.edgeWeight(node1, node2))
      }
    }

    return routingGraph
  }

  // Edge keys: "x1,y1,x2,y2" (4 parts) or "x,y" node keys (2 parts)
  parseEdgeKey(edgeKey) {
    const parts = edgeKey.split(",")
    return parts.length === 4
      ? [parts.slice(0, 2).join(","), parts.slice(2).join(",")]
      : parts
  }

  // Connect stroke-offset points on perimeter to nearest border vertices
  addPerimeterRouting(routingGraph, pathSegments, bounds) {
    const { minX, maxX, minY, maxY } = bounds

    const snapToOddInt = (v) => {
      const lower = Math.floor(v)
      const lowerOdd = lower % 2 === 0 ? lower - 1 : lower
      const upperOdd = lowerOdd + 2
      return Math.abs(v - lowerOdd) <= Math.abs(v - upperOdd) ? lowerOdd : upperOdd
    }

    for (const nodeKey of routingGraph.nodeKeys) {
      const node = routingGraph.nodeMap[nodeKey]
      const xIsInt = Number.isInteger(node.x)
      const yIsInt = Number.isInteger(node.y)
      let nearestKey = null

      if (node.x === minX && !yIsInt) {
        nearestKey = `${minX},${snapToOddInt(node.y)}`
      } else if (node.x === maxX && !yIsInt) {
        nearestKey = `${maxX},${snapToOddInt(node.y)}`
      } else if (node.y === minY && !xIsInt) {
        nearestKey = `${snapToOddInt(node.x)},${minY}`
      } else if (node.y === maxY && !xIsInt) {
        nearestKey = `${snapToOddInt(node.x)},${maxY}`
      }

      if (nearestKey) {
        const nearestNode = routingGraph.nodeMap[nearestKey]

        if (nearestNode) {
          routingGraph.addEdge(node, nearestNode, 0.01)

          const segKey = [nodeKey, nearestKey].sort().toString()

          if (!pathSegments.has(segKey)) {
            pathSegments.set(segKey, {
              vertices: [node, nearestNode],
              needsReverse: nodeKey > nearestKey,
            })
          }
        }
      }
    }

    // Connect components and add pathSegments for new edges
    const edgesBefore = new Set(routingGraph.edgeKeys)
    routingGraph.connectComponents()

    for (const edgeKey of routingGraph.edgeKeys) {
      if (!edgesBefore.has(edgeKey) && !pathSegments.has(edgeKey)) {
        const [key1, key2] = this.parseEdgeKey(edgeKey)
        const node1 = routingGraph.nodeMap[key1]
        const node2 = routingGraph.nodeMap[key2]

        if (node1 && node2) {
          pathSegments.set(edgeKey, {
            vertices: [node1, node2],
            needsReverse: key1 > key2,
          })
        }
      }
    }
  }

  // Make Dijkstra prefer border paths over interior diagonals
  updateBorderWeights(routingGraph, bounds) {
    const { minX, maxX, minY, maxY } = bounds
    const isOnBorder = (node) =>
      node.x === minX || node.x === maxX || node.y === minY || node.y === maxY

    for (const nodeKey of Object.keys(routingGraph.adjacencyList)) {
      for (const neighbor of routingGraph.adjacencyList[nodeKey]) {
        const node1 = routingGraph.nodeMap[nodeKey]
        const node2 = routingGraph.nodeMap[neighbor.node.toString()]

        if (node1 && node2) {
          const bothOnBorder = isOnBorder(node1) && isOnBorder(node2)
          neighbor.weight = bothOnBorder ? 0.01 : 1.0
        }
      }
    }
  }

  // Convert trail of node keys back to full vertex paths
  expandTrail(trail, pathSegments, routingGraph, graph) {
    const result = []

    for (let i = 0; i < trail.length - 1; i++) {
      const fromKey = trail[i]
      const toKey = trail[i + 1]
      const edgeKey = [fromKey, toKey].sort().toString()
      const segment = pathSegments.get(edgeKey)

      if (segment) {
        this.appendSegment(segment, fromKey, toKey, result)
      } else {
        this.routeViaGraph(fromKey, toKey, pathSegments, routingGraph, graph, result)
      }
    }

    return result
  }

  // Add segment vertices, handling direction and skipping shared endpoints
  appendSegment(segment, fromKey, toKey, result) {
    const goingForward = fromKey <= toKey
    const shouldReverse = goingForward ? segment.needsReverse : !segment.needsReverse
    const vertices = shouldReverse ? [...segment.vertices].reverse() : segment.vertices
    const startIdx = result.length === 0 ? 0 : 1

    for (let j = startIdx; j < vertices.length; j++) {
      result.push(new Victor(vertices[j].x, vertices[j].y))
    }
  }

  // When no stored segment exists, find path via routing graph
  routeViaGraph(fromKey, toKey, pathSegments, routingGraph, graph, result) {
    const fromNode = routingGraph.nodeMap[fromKey]
    const toNode = routingGraph.nodeMap[toKey]

    if (fromNode && toNode && routingGraph.nodeKeys.has(fromKey) && routingGraph.nodeKeys.has(toKey)) {
      const pathNodes = routingGraph.dijkstraShortestPath(fromKey, toKey)

      if (pathNodes && pathNodes.length > 1) {
        for (let p = 0; p < pathNodes.length - 1; p++) {
          const pFromKey = pathNodes[p].toString()
          const pToKey = pathNodes[p + 1].toString()
          const pEdgeKey = [pFromKey, pToKey].sort().toString()
          const pSegment = pathSegments.get(pEdgeKey)

          if (pSegment) {
            this.appendSegment(pSegment, pFromKey, pToKey, result)
          } else {
            if (result.length === 0) {
              const pFrom = routingGraph.nodeMap[pFromKey]
              if (pFrom) result.push(new Victor(pFrom.x, pFrom.y))
            }
            const pTo = routingGraph.nodeMap[pToKey]
            if (pTo) result.push(new Victor(pTo.x, pTo.y))
          }
        }
        return
      }
    }

    // Fallback: direct line
    if (result.length === 0) {
      const fallbackFrom = graph.nodeMap[fromKey]

      if (fallbackFrom) result.push(new Victor(fallbackFrom.x, fallbackFrom.y))
    }
    const fallbackTo = graph.nodeMap[toKey]

    if (fallbackTo) result.push(new Victor(fallbackTo.x, fallbackTo.y))
  }

  vertexToNode(v) {
    const key = `${v.x},${v.y}`

    return { x: v.x, y: v.y, toString: () => key }
  }

  getBounds(paths) {
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity

    for (const path of paths) {
      for (const v of path) {
        minX = Math.min(minX, v.x)
        maxX = Math.max(maxX, v.x)
        minY = Math.min(minY, v.y)
        maxY = Math.max(maxY, v.y)
      }
    }

    return { minX, maxX, minY, maxY }
  }
}
