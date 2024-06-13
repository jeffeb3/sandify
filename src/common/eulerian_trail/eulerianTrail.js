// adapted from https://github.com/mauriciopoppe/eulerian-trail/blob/master/lib/eulerian-trail.js
// see LICENSE for license details
// commented out thrown exceptions to return non-optimal eulerian paths
export const eulerianTrail = (options) => {
  var g = []
  var i
  var edgePointer = []
  var edgeUsed = []
  var trail = []

  var id = {}
  var idReverse = []
  var idCount = 0

  function getId(x) {
    if (!id[x]) {
      edgePointer[idCount] = 0
      idReverse[idCount] = x
      id[x] = idCount++
    }
    return id[x]
  }

  function dfs(v) {
    for (; edgePointer[v] < g[v].length; edgePointer[v] += 1) {
      var edge = g[v][edgePointer[v]]
      var to = edge[0]
      var id = edge[1]
      if (!edgeUsed[id]) {
        edgeUsed[id] = true
        dfs(to)
      }
    }
    trail.push(v)
  }

  function pushEdge(u, v, id) {
    g[u] = g[u] || []
    g[v] = g[v] || []
    g[u].push([v, id])
  }

  var deg = []
  var inDeg = [],
    outDeg = []

  for (i = 0; i < options.edges.length; i += 1) {
    var edge = options.edges[i]
    var u = getId(edge[0])
    var v = getId(edge[1])

    pushEdge(u, v, i)
    if (!options.directed) {
      pushEdge(v, u, i)
    }

    if (options.directed) {
      outDeg[u] = outDeg[u] || 0
      inDeg[u] = inDeg[u] || 0
      outDeg[v] = outDeg[v] || 0
      inDeg[v] = inDeg[v] || 0
      outDeg[u] += 1
      inDeg[v] += 1
    } else {
      deg[u] = deg[u] || 0
      deg[v] = deg[v] || 0
      deg[u] += 1
      deg[v] += 1
    }
  }

  function checkDirected() {
    var oddVertex = 0
    var start = 0

    for (i = 0; i < idCount; i += 1) {
      if (outDeg[i] - inDeg[i] !== 0) {
        if (outDeg[i] > inDeg[i]) {
          start = i
        }
        oddVertex += 1
      }
    }
    return { odd: oddVertex, start }
  }

  function checkUndirected() {
    var oddVertex = 0
    var start = 0

    for (i = 0; i < idCount; i += 1) {
      if (deg[i] % 2 !== 0) {
        start = i
        oddVertex += 1
      }
    }
    return { odd: oddVertex, start }
  }

  var check = options.directed ? checkDirected() : checkUndirected()
  if (check.odd % 2 !== 0 || check.odd > 2) {
    //    throw Error('the graph does not have an eulerian trail')
  }
  dfs(check.start)

  if (trail.length !== options.edges.length + 1) {
    //    throw Error('the graph does not have an eulerian trail')
  }

  trail.reverse()

  // id to input
  return trail.map(function (id) {
    return idReverse[id]
  })
}
