import Victor from 'victor'
import Graph, { vec2, mix } from '../../common/Graph'
import eulerianTrail from '../../common/eulerianTrail'
import { difference } from '../../common/util'
import Shape, { shapeOptions } from '../Shape'

const vec_triangle = [
  vec2(-0.85, -0.4907477295),
  vec2(0.85, -0.4907477295),
  vec2(0.0,  0.9814954573),
]

const vec_square = [
  vec2(-0.7, -0.7),
  vec2( 0.7,  0.7),
  vec2(-0.7,  0.7),

  vec2(-0.7, -0.7),
  vec2(0.7,  0.7),
  vec2(0.7, -0.7)
]

function getEdges(edges, a, b, c, count, settings) {
  let da, db, dc

  if (count === 0) {
    if (settings.rotate > 0) {
      da = Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2)) * (settings.rotate * Math.PI / 180.0)
      db = Math.sqrt(Math.pow(b[0], 2) + Math.pow(b[1], 2)) * (settings.rotate * Math.PI / 180.0)
      dc = Math.sqrt(Math.pow(c[0], 2) + Math.pow(c[1], 2)) * (settings.rotate * Math.PI / 180.0)
    } else {
      da = (settings.rotate * Math.PI / 180.0)
      db = (settings.rotate * Math.PI / 180.0)
      dc = (settings.rotate * Math.PI / 180.0)
    }

    let ap = vec2(
      (a[0] * Math.cos(da)) - (a[1] * Math.sin(da)),
      (a[0] * Math.sin(da)) + (a[1] * Math.cos(da)))
    let bp = vec2(
      (b[0] * Math.cos(db)) - (b[1] * Math.sin(db)),
      (b[0] * Math.sin(db)) + (b[1] * Math.cos(db)))
    let cp = vec2(
      (c[0] * Math.cos(dc)) - (c[1] * Math.sin(dc)),
      (c[0] * Math.sin(dc)) + (c[1] * Math.cos(dc)))

    edges.push([ap, bp], [ap, cp], [bp, cp])
    return
  }

  let ab = mix(a, b, 0.5)
  let ac = mix(a, c, 0.5)
  let bc = mix(b, c, 0.5)

  getEdges(edges, ab, ac, bc, count - 1, settings)
  getEdges(edges, c, ac, bc, count - 1, settings)
  getEdges(edges, b, bc, ab, count - 1, settings)
  getEdges(edges, a, ab, ac, count - 1, settings)
}

const options = {
  ...shapeOptions,
  ...{
    tessellationTwistNumSides: {
      title: "Number of sides",
      min: 3
    },
    tessellationTwistIterations: {
      title: "Iterations",
      min: 0,
      max: 4
    },
    tessellationTwistRotate: {
      title: "Rotate and twist",
      step: 5,
      min: 0
    }
  }
}

// Adapted from https://codepen.io/rafaelpascoalrodrigues/pen/KpBJve.
export default class TessellationTwist extends Shape {
  constructor() {
    super('Tessellation Twist')
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        type: 'tessellation_twist',
        startingSize: 110,
        repeatEnabled: false,
        tessellationTwistNumSides: 5,
        tessellationTwistIterations: 2,
        tessellationTwistRotate: 0
      }
    }
  }

  getShapeVertices(numSides) {
    let vertices = []
    for (let i=0; i<=numSides; i++) {
      let angle = Math.PI * 2.0 / numSides * (0.5 + i)
      let angle2 = Math.PI * 2.0 / numSides * (0.5 + ((i + 1) % numSides))

      vertices.push(vec2(0, 0))
      vertices.push(vec2(Math.cos(angle), Math.sin(angle)))
      vertices.push(vec2(Math.cos(angle2), Math.sin(angle2)))
    }
    return vertices
  }

  getVertices(state) {
    let vertices
    let edges = []
    const tessellation = parseInt(state.shape.tessellationTwistIterations)
    const sides = parseInt(state.shape.tessellationTwistNumSides)

    switch (sides) {
      case 3:
        vertices = vec_triangle.slice(0)
        break
      case 4:
        vertices = vec_square.slice(0)
        break
      default:
        vertices = this.getShapeVertices(sides)
        break
    }

    // build our tessellations
    for (var i = 0; i < vertices.length; i += 3) {
      getEdges(edges, vertices[i + 0], vertices[i + 1], vertices[i + 2],
        tessellation, { rotate: parseInt(state.shape.tessellationTwistRotate) })
    }

    // build edge and adjacency maps; this serves to ensure unique
    // vertices and edges, and give us a string-based key to access and run
    // algorithms on them.
    let vertexMap = new Map()
    let edgeMap = new Map()

    edges.forEach((edge) => {
      let v1 = edge[0]
      let v2 = edge[1]
      let value = [v1.toString(), v2.toString()]

      vertexMap.set(v1.toString(), v1)
      vertexMap.set(v2.toString(), v2)
      edgeMap.set(value.sort().toString(), value)
    })

    // build a graph
    let graph = new Graph()
    vertexMap.forEach((vertex, key) => graph.addNode(key))
    edgeMap.forEach((edge, key) => graph.addEdge(edge[0], edge[1]))

    // find the eulerian trail that efficiently visits all of the vertices
    let edges2 = Array.from(edgeMap.values())
    let trail = eulerianTrail({edges: edges2})
    let prevKey
    let walkedVertices = []
    var walkedEdges = []

    // if there are nodes with an odd number of edges (as in pentagon and hexagon)
    // there is not a eulerian trail that visits all of the nodes. So we need to identify
    // the missing nodes and create edges for them. There is a complex algorithm
    // (chinese postman) that can be used to do this for the general case, but
    // it's computationally expensive and overkill for our situation.
    for (i = 0; i < trail.length-1; i++) {
      let edge = [trail[i], trail[i+1]].sort().toString()
      walkedEdges.push(edge)
    }
    walkedEdges = Array.from(new Set(walkedEdges))
    let missingEdges = difference(walkedEdges, graph.edges).reduce((hash, d) => {
      d = d.split(',')
      hash[d[0] + ',' + d[1]] = d[2] + ',' + d[3]
      return hash
    }, {})

    trail.forEach((key, index) => {
      let vertex = vertexMap.get(key)

      if (prevKey) {
        let edgeKey = [key, prevKey].sort().toString()

        if (!edgeMap.get(edgeKey)) {
          // non-eulerian move, so we'll walk the shortest valid path between them
          let path = graph.dijkstraShortestPath(prevKey, key)
          path.shift()
          path.forEach((walkedKey) => {
            let walkedVertex = vertexMap.get(walkedKey)
            walkedVertices.push(Victor(walkedVertex[0], walkedVertex[1]))
          })
          walkedVertices.push(Victor(vertex[0], vertex[1]))
        } else {
          walkedVertices.push(Victor(vertex[0], vertex[1]))
        }
      } else {
        walkedVertices.push(Victor(vertex[0], vertex[1]))
      }

      // add any missing edges
      if (missingEdges[key]) {
        let missingVertex = vertexMap.get(missingEdges[key])
        let edgeKey = [key, missingEdges[key]].sort().toString()

        if (edgeMap.get(edgeKey)) {
          // only add valid edges
          walkedVertices.push(Victor(missingVertex[0], missingVertex[1]))
          walkedVertices.push(Victor(vertex[0], vertex[1]))
        }
        delete missingEdges[key]
      }

      prevKey = key
    })

    return walkedVertices
  }

  getOptions() {
    return options
  }
}
