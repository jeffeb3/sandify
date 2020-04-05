import { PriorityQueue } from './PriorityQueue.js'

export const mix = (u, v, s) => {
  var result = []
  for (var i = 0; i < u.length; ++i ) {
    result.push((1.0 - s) * u[i] + s * v[i])
  }

  return result
}

export const vec2 = (...args) => {
  switch (args.length) {
    case 0: args.push(0.0); break
    default: args.push(0.0)
  }

  return args.splice(0, 2)
}

export class Graph {
  constructor() {
    this.nodes = []
    this.adjacencyList = {}
    this.edges = []
  }

  addNode(node) {
    this.nodes.push(node)
    this.adjacencyList[node] = []
  }

  addEdge(node1, node2, weight=1) {
    this.adjacencyList[node1].push({node:node2, weight: weight})
    this.adjacencyList[node2].push({node:node1, weight: weight})
    this.edges.push([node1.toString(), node2.toString()].sort().toString())
  }

  dijkstraShortestPath(startNode, endNode) {
    let times = {}
    let backtrace = {}
    let pq = new PriorityQueue()

    times[startNode] = 0

    this.nodes.forEach(node => {
      if (node !== startNode) {
        times[node] = Infinity
      }
    })

    pq.enqueue([startNode, 0])

    while (!pq.isEmpty()) {
      let shortestStep = pq.dequeue()
      let currentNode = shortestStep[0]
      this.adjacencyList[currentNode].forEach(neighbor => {
        let time = times[currentNode] + neighbor.weight

        if (time < times[neighbor.node]) {
          times[neighbor.node] = time
          backtrace[neighbor.node] = currentNode
          pq.enqueue([neighbor.node, time])
        }
      })
    }

    let path = [endNode]
    let lastStep = endNode
    while(lastStep !== startNode) {
      path.unshift(backtrace[lastStep])
      lastStep = backtrace[lastStep]
    }

    return path
  }
}
