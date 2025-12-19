// Chinese Postman (Route Inspection) Algorithm
// Finds the minimum-cost path that visits every edge at least once.
// Works with plain edge arrays; uses provided Dijkstra function for shortest paths.

function buildAdjacencyList(edges) {
  const adj = new Map()

  for (const [n1, n2] of edges) {
    if (!adj.has(n1)) adj.set(n1, [])
    if (!adj.has(n2)) adj.set(n2, [])
    adj.get(n1).push(n2)
    adj.get(n2).push(n1)
  }

  return adj
}

function findOddVertices(adjacencyList) {
  const odd = []

  for (const [nodeKey, neighbors] of adjacencyList) {
    if (neighbors.length % 2 !== 0) {
      odd.push(nodeKey)
    }
  }

  return odd
}

function computePairwiseDistances(vertices, dijkstraFn) {
  const distances = new Map()

  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      const v1 = vertices[i]
      const v2 = vertices[j]
      const path = dijkstraFn(v1, v2)
      const distance = path ? path.length - 1 : Infinity
      const key = [v1, v2].sort().join("|")

      distances.set(key, { distance, path, v1, v2 })
    }
  }

  return distances
}

function greedyMinimumMatching(vertices, distances) {
  if (vertices.length === 0 || vertices.length % 2 !== 0) {
    return []
  }

  const edges = Array.from(distances.values())

  edges.sort((a, b) => a.distance - b.distance)

  const matched = new Set()
  const matching = []

  for (const edge of edges) {
    if (!matched.has(edge.v1) && !matched.has(edge.v2)) {
      matching.push(edge)
      matched.add(edge.v1)
      matched.add(edge.v2)

      if (matched.size === vertices.length) {
        break
      }
    }
  }

  return matching
}

const MAX_ODD_VERTICES_FOR_FULL = 30

function nearestNeighborMatching(vertices, adjacencyList) {
  if (vertices.length === 0 || vertices.length % 2 !== 0) {
    return []
  }

  const matching = []
  const unmatched = new Set(vertices)

  while (unmatched.size > 0) {
    const v1 = unmatched.values().next().value

    unmatched.delete(v1)

    // Find nearest unmatched vertex by graph distance (BFS)
    let nearest = null
    let nearestPath = null
    const visited = new Set([v1])
    const queue = [[v1, [v1]]]

    while (queue.length > 0 && !nearest) {
      const [current, path] = queue.shift()
      const neighbors = adjacencyList.get(current) || []

      for (const neighbor of neighbors) {
        if (visited.has(neighbor)) continue

        visited.add(neighbor)
        const newPath = [...path, neighbor]

        if (unmatched.has(neighbor)) {
          nearest = neighbor
          nearestPath = newPath
          break
        }

        queue.push([neighbor, newPath])
      }
    }

    if (nearest) {
      unmatched.delete(nearest)
      matching.push({ v1, v2: nearest, pathKeys: nearestPath })
    }
  }

  return matching
}

/**
 * Eulerize an edge array using Chinese Postman algorithm
 * Returns a new edge array with duplicate edges added to make all vertices even-degree
 */
export function eulerizeEdges(edges, dijkstraFn, nodeMap = null) {
  const adjacencyList = buildAdjacencyList(edges)
  const oddVertices = findOddVertices(adjacencyList)

  if (oddVertices.length === 0 || oddVertices.length % 2 !== 0) {
    return {
      edges: [...edges],
      oddVertices,
      matching: [],
      duplicateCount: 0,
    }
  }

  const verticesToMatch = oddVertices

  let matching

  if (verticesToMatch.length <= MAX_ODD_VERTICES_FOR_FULL) {
    // Full pairwise Dijkstra for small vertex sets
    const distances = computePairwiseDistances(verticesToMatch, dijkstraFn)

    matching = greedyMinimumMatching(verticesToMatch, distances)
  } else {
    // Fast nearest-neighbor for large vertex sets
    matching = nearestNeighborMatching(verticesToMatch, adjacencyList)
  }

  // Build new edge array with duplicates
  const newEdges = [...edges]
  let duplicateCount = 0

  for (const match of matching) {
    // Handle both formats: {path} from Dijkstra or {pathKeys} from BFS
    const path = match.path || (match.pathKeys && nodeMap
      ? match.pathKeys.map(k => nodeMap[k] || { toString: () => k })
      : match.pathKeys?.map(k => ({ toString: () => k })))

    if (!path || path.length < 2) continue

    for (let i = 0; i < path.length - 1; i++) {
      const n1 = path[i].toString()
      const n2 = path[i + 1].toString()

      newEdges.push([n1, n2])
      duplicateCount++
    }
  }

  return {
    edges: newEdges,
    oddVertices,
    matching,
    duplicateCount,
  }
}
