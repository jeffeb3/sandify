import { PriorityQueue } from "./PriorityQueue.js"
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

// note: requires string-based nodes to work properly
export default class Graph {
  constructor() {
    this.nodeMap = {}
    // eslint-disable-next-line no-undef
    this.nodeKeys = new Set()

    this.adjacencyList = {}
    this.edgeMap = {}

    // eslint-disable-next-line no-undef
    this.edgeKeys = new Set()
    this.clearCachedPaths()
  }

  addNode(node) {
    let key = node.toString()

    if (!this.nodeKeys.has(key)) {
      this.nodeKeys.add(key)
      this.nodeMap[key] = node
      this.adjacencyList[key] = []
      this.clearCachedPaths()
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
      this.clearCachedPaths()
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

  dijkstraShortestPath(startNode, endNode) {
    let shortest = this.getCachedShortestPath(startNode, endNode)

    if (shortest === undefined) {
      let times = {}
      let backtrace = {}
      let pq = new PriorityQueue()
      let nodes = this.nodeKeys

      times[startNode] = 0

      nodes.forEach((node) => {
        if (node !== startNode) {
          times[node] = Infinity
        }
      })

      pq.enqueue([startNode, 0])

      while (!pq.isEmpty()) {
        let shortestStep = pq.dequeue()
        let currentNode = shortestStep[0]
        this.adjacencyList[currentNode.toString()].forEach((neighbor) => {
          let time = times[currentNode] + neighbor.weight

          if (time < times[neighbor.node]) {
            times[neighbor.node] = time
            backtrace[neighbor.node] = currentNode
            pq.enqueue([neighbor.node, time])
          }
        })
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
