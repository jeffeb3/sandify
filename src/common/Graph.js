import Victor from "victor"

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

  // Dijkstra's algorithm - use when edges have varying weights.
  // Note: if weighted edges are needed, optimize with a binary heap for
  // O((V+E) log V) instead of current O(V * E log V) from array sort.
  dijkstraShortestPath(startNode, endNode) {
    let shortest = this.getCachedShortestPath(startNode, endNode)

    if (shortest === undefined) {
      const times = {}
      const backtrace = {}
      const visited = new Set()
      const pq = [[startNode, 0]]

      times[startNode] = 0
      this.nodeKeys.forEach((node) => {
        if (node !== startNode) {
          times[node] = Infinity
        }
      })

      while (pq.length > 0) {
        pq.sort((a, b) => a[1] - b[1])
        const [currentNode] = pq.shift()

        if (visited.has(currentNode)) continue
        visited.add(currentNode)

        for (const neighbor of this.adjacencyList[currentNode]) {
          const neighborKey = neighbor.node.toString()
          const time = times[currentNode] + neighbor.weight

          if (time < times[neighborKey]) {
            times[neighborKey] = time
            backtrace[neighborKey] = currentNode
            pq.push([neighborKey, time])
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
}
