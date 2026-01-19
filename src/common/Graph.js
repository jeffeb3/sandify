import { PriorityQueue } from "./PriorityQueue"
import UnionFind from "./UnionFind"
import Victor from "victor"
import { eulerianTrail as computeEulerianTrail } from "./eulerian_trail/eulerianTrail"
import { eulerizeEdges } from "./chinesePostman"

export const mix = (v1, v2, s) => {
  let u = [v1.x, v1.y]
  let v = [v2.x, v2.y]
  var result = []

  for (var i = 0; i < u.length; ++i) {
    result.push((1.0 - s) * u[i] + s * v[i])
  }

  return new Victor(result[0], result[1])
}

export const buildGraph = (nodes) => {
  const graph = new Graph()

  if (nodes.length > 0) {
    graph.addNode(nodes[0])
  }

  for (let i = 0; i < nodes.length - 1; i++) {
    const node1 = nodes[i]
    const node2 = nodes[i + 1]
    graph.addNode(node2)
    graph.addEdge(node1, node2)
  }

  return graph
}

export const edgeKey = (node1, node2) => {
  const node1Key = node1.toString()
  const node2Key = node2.toString()

  return [node1Key, node2Key].sort().toString()
}

// Note: requires string-based nodes to work properly.
// Path cache is not invalidated on addNode/addEdge for performance.
// If modifying graph after computing paths, call clearCachedPaths() manually.
export default class Graph {
  constructor() {
    this.nodeMap = {}

    this.nodeKeys = new Set()

    this.adjacencyList = {}
    this.edgeMap = {}

    this.edgeKeys = new Set()
    this.clearCachedPaths()
  }

  addNode(node) {
    let key = node.toString()

    if (!this.nodeKeys.has(key)) {
      this.nodeKeys.add(key)
      this.nodeMap[key] = node
      this.adjacencyList[key] = []
    }
  }

  addEdge(node1, node2, weight = 1) {
    let node1Key = node1.toString()
    let node2Key = node2.toString()
    let edge12Key = edgeKey(node1, node2)

    if (!this.edgeKeys.has(edge12Key)) {
      this.adjacencyList[node1Key].push({ node: node2, weight })
      this.adjacencyList[node2Key].push({ node: node1, weight })
      this.edgeKeys.add(edge12Key)
      this.edgeMap[edge12Key] = [node1.toString(), node2.toString()]
    }
  }

  hasEdge(ekey1, ekey2) {
    let edgeKey = [ekey1, ekey2].sort().toString()
    return this.edgeMap[edgeKey]
  }

  neighbors(node) {
    return this.adjacencyList[node.toString()].map((hash) => hash.node)
  }

  getNode(node) {
    return this.nodeMap[node.toString()]
  }

  findNode(fn) {
    return Object.values(this.nodeMap).find(fn)
  }

  // BFS-based shortest path - optimal for uniform edge weights
  bfsShortestPath(startNode, endNode) {
    let shortest = this.getCachedShortestPath(startNode, endNode)

    if (shortest === undefined) {
      const backtrace = {}
      const visited = new Set()
      const queue = [startNode]

      visited.add(startNode)

      while (queue.length > 0) {
        const currentNode = queue.shift()

        if (currentNode === endNode) {
          break
        }

        for (const neighbor of this.adjacencyList[currentNode]) {
          const neighborKey = neighbor.node.toString()

          if (!visited.has(neighborKey)) {
            visited.add(neighborKey)
            backtrace[neighborKey] = currentNode
            queue.push(neighborKey)
          }
        }
      }

      let path = [endNode.toString()]
      let lastStep = endNode

      while (lastStep !== startNode) {
        path.unshift(backtrace[lastStep].toString())
        lastStep = backtrace[lastStep]
      }

      shortest = path.map((node) => this.nodeMap[node])
      this.cacheShortestPath(startNode, endNode, shortest)
    }

    return shortest
  }

  // Dijkstra's algorithm with binary heap - O((V+E) log V)
  dijkstraShortestPath(startNode, endNode) {
    let shortest = this.getCachedShortestPath(startNode, endNode)

    if (shortest === undefined) {
      const times = {}
      const backtrace = {}
      const pq = new PriorityQueue()

      times[startNode] = 0
      this.nodeKeys.forEach((node) => {
        if (node !== startNode) {
          times[node] = Infinity
        }
      })

      pq.enqueue([startNode, 0])

      while (!pq.isEmpty()) {
        const [currentNode] = pq.dequeue()

        for (const neighbor of this.adjacencyList[currentNode]) {
          const neighborKey = neighbor.node.toString()
          const time = times[currentNode] + neighbor.weight

          if (time < times[neighborKey]) {
            times[neighborKey] = time
            backtrace[neighborKey] = currentNode
            pq.enqueue([neighborKey, time])
          }
        }
      }

      let path = [endNode.toString()]
      let lastStep = endNode

      while (lastStep !== startNode) {
        path.unshift(backtrace[lastStep].toString())
        lastStep = backtrace[lastStep]
      }

      shortest = path.map((node) => this.nodeMap[node])
      this.cacheShortestPath(startNode, endNode, shortest)
    }

    return shortest
  }

  clearCachedPaths() {
    this.cachedPaths = {}
  }

  cacheShortestPath(node1, node2, path) {
    this.cachedPaths[this.getPairedKey(node1, node2)] = [...path]
    this.cachedPaths[this.getPairedKey(node2, node1)] = [...path].reverse()
  }

  getCachedShortestPath(node1, node2) {
    let shortest = this.cachedPaths[this.getPairedKey(node1, node2)]
    return shortest === undefined ? undefined : [...shortest]
  }

  getPairedKey(node1, node2) {
    return node1.toString() + "-" + node2.toString()
  }

  // Find connected components in the graph via DFS
  // Returns array of components, each component is array of node keys
  findComponents() {
    const visited = new Set()
    const components = []

    for (const nodeKey of this.nodeKeys) {
      if (visited.has(nodeKey)) continue

      const component = []
      const stack = [nodeKey]

      while (stack.length > 0) {
        const key = stack.pop()

        if (visited.has(key)) continue

        visited.add(key)
        component.push(key)

        const neighbors = this.adjacencyList[key] || []

        for (const { node } of neighbors) {
          const neighborKey = node.toString()

          if (!visited.has(neighborKey)) {
            stack.push(neighborKey)
          }
        }
      }

      components.push(component)
    }

    return components
  }

  // Add bridge edges to connect disconnected components using MST (Kruskal's algorithm)
  connectComponents() {
    const components = this.findComponents()

    if (components.length <= 1) return

    // Build list of all possible bridges between all component pairs
    // Then use Kruskal-style MST to connect them optimally
    const allBridges = []

    for (let i = 0; i < components.length; i++) {
      for (let j = i + 1; j < components.length; j++) {
        let bestDist = Infinity
        let bestPair = null

        // Find shortest bridge between component i and j
        for (const key1 of components[i]) {
          const node1 = this.nodeMap[key1]

          for (const key2 of components[j]) {
            const node2 = this.nodeMap[key2]
            const dist = Math.hypot(node1.x - node2.x, node1.y - node2.y)

            if (dist < bestDist) {
              bestDist = dist
              bestPair = [node1, node2]
            }
          }
        }

        if (bestPair) {
          allBridges.push({
            dist: bestDist,
            pair: bestPair,
            comp1: i,
            comp2: j,
          })
        }
      }
    }

    // Sort bridges by distance (shortest first)
    allBridges.sort((a, b) => a.dist - b.dist)

    const uf = new UnionFind()

    for (let i = 0; i < components.length; i++) {
      uf.makeSet(i)
    }

    // Kruskal's algorithm: add shortest bridges that connect new components
    for (const bridge of allBridges) {
      if (uf.union(bridge.comp1, bridge.comp2)) {
        this.addEdge(bridge.pair[0], bridge.pair[1])
      }
    }
  }
}

// Compute Eulerian trail over all edges in a graph using Chinese Postman algorithm.
// Returns array of node keys representing the trail.
// Use graph.nodeMap[key] to get the actual node objects.
export const getEulerianTrail = (graph) => {
  const edges = Object.values(graph.edgeMap)
  const dijkstraFn = (startKey, endKey) =>
    graph.dijkstraShortestPath(startKey, endKey)
  const { edges: eulerizedEdges } = eulerizeEdges(
    edges,
    dijkstraFn,
    graph.nodeMap,
  )

  return computeEulerianTrail({ edges: eulerizedEdges })
}
