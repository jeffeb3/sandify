import { uniqBy } from "lodash"
import seedrandom from "seedrandom"
import noise from "@/common/noise"
import { mixin } from "@/common/util"
import Effect from "./Effect"
import { VoronoiMixin } from "@/common/voronoi"
import {
  centerOnOrigin,
  dimensions,
  shiftToFirstQuadrant,
  cloneVertices,
  vertexRoundP,
} from "@/common/geometry"

export const voronoiOptions = {
  seed: {
    title: "Random seed",
    min: 1,
    randomMax: 1000,
  },
  voronoiPolygon: {
    title: "Polygon",
    type: "togglebutton",
    choices: ["voronoi", "delaunay"],
  },
  voronoiUniformity: {
    title: "Uniformity",
    type: "slider",
    min: 0,
    max: 20,
  },
}

export default class Voronoi extends Effect {
  constructor() {
    super("voronoi")
    this.label = "Voronoi"
    this.description =
      "A Voronoi diagram divides a space into regions based on a set of seed points. Each region contains all the points that are closer to its seed point than to any other seed point."
    this.shouldCache = true
  }

  canMove(state) {
    return false
  }

  canRotate(state) {
    return false
  }

  canChangeSize(state) {
    return false
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        voronoiPolygon: "voronoi",
        voronoiUniformity: 0,
        seed: 1,
      },
    }
  }

  getVertices(effect, layer, vertices) {
    const { seed, voronoiPolygon, voronoiUniformity = 0 } = effect
    const { width, height } = dimensions(vertices)

    this.rng = seedrandom(seed)
    noise.seed(seed)

    const mappedVertices = uniqBy(
      shiftToFirstQuadrant(cloneVertices(vertices)).map((vertex) =>
        vertexRoundP(vertex, 2),
      ),
      (vertex) => vertex.toString(),
    )
    let points = this.generatePointsFromVertices(mappedVertices)

    if (voronoiUniformity > 0) {
      points = this.relaxPoints(points, width, height, voronoiUniformity)
    }

    this.graph = this.buildGraph(points, voronoiPolygon, width, height)

    this.vertices = []
    this.visited = {}

    const start = this.getStartNode(this.graph, width, height)
    if (start) this.walkNode(start)

    return centerOnOrigin(this.vertices)
  }

  getOptions() {
    return voronoiOptions
  }

  generatePointsFromVertices(vertices) {
    return vertices.map((vertex) => [vertex.x, vertex.y])
  }
}

mixin(Voronoi, VoronoiMixin)
