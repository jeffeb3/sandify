import Victor from "victor"
import Graph, { mix } from "@/common/Graph"
import { eulerianTrail } from "@/common/eulerian_trail/eulerianTrail"
import { difference } from "@/common/util"
import { cloneVertices } from "@/common/geometry"
import Shape from "../Shape"

const vecTriangle = [
  new Victor(-0.85, -0.4907477295),
  new Victor(0.85, -0.4907477295),
  new Victor(0.0, 0.9814954573),
]
const vecSquare = [
  new Victor(-0.7, -0.7),
  new Victor(0.7, 0.7),
  new Victor(-0.7, 0.7),
  new Victor(-0.7, -0.7),
  new Victor(0.7, 0.7),
  new Victor(0.7, -0.7),
]

function getEdges(edges, a, b, c, count, settings) {
  let da, db, dc

  if (count === 0) {
    if (settings.rotate > 0) {
      da =
        Math.sqrt(Math.pow(a.x, 2) + Math.pow(a.y, 2)) *
        ((settings.rotate * Math.PI) / 180.0)
      db =
        Math.sqrt(Math.pow(b.x, 2) + Math.pow(b.y, 2)) *
        ((settings.rotate * Math.PI) / 180.0)
      dc =
        Math.sqrt(Math.pow(c.x, 2) + Math.pow(c.y, 2)) *
        ((settings.rotate * Math.PI) / 180.0)
    } else {
      da = (settings.rotate * Math.PI) / 180.0
      db = (settings.rotate * Math.PI) / 180.0
      dc = (settings.rotate * Math.PI) / 180.0
    }

    let ap = new Victor(
      a.x * Math.cos(da) - a.y * Math.sin(da),
      a.x * Math.sin(da) + a.y * Math.cos(da),
    )
    let bp = new Victor(
      b.x * Math.cos(db) - b.y * Math.sin(db),
      b.x * Math.sin(db) + b.y * Math.cos(db),
    )
    let cp = new Victor(
      c.x * Math.cos(dc) - c.y * Math.sin(dc),
      c.x * Math.sin(dc) + c.y * Math.cos(dc),
    )

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
  tessellationTwistNumSides: {
    title: "Number of sides",
    min: 3,
  },
  tessellationTwistIterations: {
    title: "Iterations",
    min: 0,
    max: 4,
  },
  tessellationTwistRotate: {
    title: "Rotate and twist",
    step: 5,
    min: 0,
    random: 0.6,
    randomMax: 180,
  },
}

// Adapted from https://codepen.io/rafaelpascoalrodrigues/pen/KpBJve.
// See LICENSE for licensing details.
export default class TessellationTwist extends Shape {
  constructor() {
    super("tessellationTwist")
    this.label = "Tessellation twist"
    this.link = "https://en.wikipedia.org/wiki/Tessellation"
    this.linkText = "Wikipedia"
    this.description =
      "The tessellation twist shape is form of tessellation. Tessellations cover a surface using tiles (in our case an equilateral triangle) with no overlaps or gaps."
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        tessellationTwistNumSides: 5,
        tessellationTwistIterations: 2,
        tessellationTwistRotate: 0,
      },
    }
  }

  getShapeVertices(numSides) {
    const vertices = []

    for (let i = 0; i <= numSides; i++) {
      let angle = ((Math.PI * 2.0) / numSides) * (0.5 + i)
      let angle2 = ((Math.PI * 2.0) / numSides) * (0.5 + ((i + 1) % numSides))

      vertices.push(new Victor(0, 0))
      vertices.push(new Victor(Math.cos(angle), Math.sin(angle)))
      vertices.push(new Victor(Math.cos(angle2), Math.sin(angle2)))
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
        vertices = vecTriangle.slice(0)
        break
      case 4:
        vertices = vecSquare.slice(0)
        break
      default:
        vertices = this.getShapeVertices(sides)
        break
    }

    // build our tessellations
    for (var i = 0; i < vertices.length; i += 3) {
      getEdges(
        edges,
        vertices[i + 0],
        vertices[i + 1],
        vertices[i + 2],
        tessellation,
        { rotate: parseInt(state.shape.tessellationTwistRotate) },
      )
    }

    // build edge and adjacency maps; this serves to ensure unique
    // vertices and edges, and give us a string-based key to access and run
    // algorithms on them.
    let graph = new Graph()

    edges.forEach((edge) => {
      let v1 = edge[0]
      let v2 = edge[1]

      graph.addNode(v1)
      graph.addNode(v2)
      graph.addEdge(v1, v2)
    })

    // build a graph
    // find the eulerian trail that efficiently visits all of the vertices
    let trail = eulerianTrail({ edges: Object.values(graph.edgeMap) })

    let prevKey
    let walkedVertices = []
    var walkedEdges = []

    // if there are nodes with an odd number of edges (as in pentagon and hexagon)
    // there is not a eulerian trail that visits all of the nodes. So we need to identify
    // the missing nodes and create edges for them. There is a complex algorithm
    // (chinese postman) that can be used to do this for the general case, but
    // it's computationally expensive and overkill for our situation.
    for (i = 0; i < trail.length - 1; i++) {
      let edge = [trail[i], trail[i + 1]].sort().toString()
      walkedEdges.push(edge)
    }
    walkedEdges = new Set(walkedEdges)

    let missingEdges = Array.from(
      difference(walkedEdges, graph.edgeKeys),
    ).reduce((hash, d) => {
      d = d.split(",")
      hash[d[0] + "," + d[1]] = d[2] + "," + d[3]
      return hash
    }, {})

    trail.forEach((key, index) => {
      let vertex = graph.nodeMap[key]

      if (prevKey) {
        if (!graph.hasEdge(key, prevKey)) {
          // non-eulerian move, so we'll walk the shortest valid path between them
          let path = graph.dijkstraShortestPath(prevKey, key)
          path.shift()
          path.forEach((node) => walkedVertices.push(node))
          walkedVertices.push(vertex)
        } else {
          walkedVertices.push(vertex)
        }
      } else {
        walkedVertices.push(vertex)
      }

      // add any missing edges
      if (missingEdges[key]) {
        let missingVertex = graph.nodeMap[missingEdges[key]]
        let edgeKey = [key, missingEdges[key]].sort().toString()

        if (graph.edgeMap[edgeKey]) {
          // only add valid edges
          walkedVertices.push(missingVertex)
          walkedVertices.push(vertex)
        }
        delete missingEdges[key]
      }

      prevKey = key
    })

    const scale = 10.5 // to normalize starting size
    walkedVertices.forEach((point) => {
      if (!point.visited) {
        point.multiply({ x: scale, y: scale })
        point.visited = true
      }
    })

    // cloned because some vertices are included multiple times and we need to de-dupe
    return cloneVertices(walkedVertices)
  }

  getOptions() {
    return options
  }
}
