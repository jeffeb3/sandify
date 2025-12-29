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
import i18n from "@/i18n"

export const voronoiOptions = () => ({
  seed: {
    title: i18n.t("effects.voronoi.randomSeed"),
    min: 1,
    randomMax: 1000,
  },
  voronoiPolygon: {
    title: i18n.t("effects.voronoi.polygon"),
    type: "togglebutton",
    choices: [
      {"title": i18n.t("effects.voronoi.voronoiType"), "value": "voronoi"}, 
      {"title": i18n.t("effects.voronoi.delaunay"), "value": "delaunay"}
    ],
  },
})

export default class Voronoi extends Effect {
  constructor() {
    super("voronoi")
    this.label = i18n.t("effects.voronoi.voronoi")
    this.description = i18n.t("effects.voronoi.description")
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
        seed: 1,
      },
    }
  }

  getVertices(effect, layer, vertices) {
    const { seed, voronoiPolygon } = effect
    const { width, height } = dimensions(vertices)
    this.rng = seedrandom(seed)
    noise.seed(seed)

    const mappedVertices = uniqBy(
      shiftToFirstQuadrant(cloneVertices(vertices)).map((vertex) =>
        vertexRoundP(vertex, 2),
      ),
      (vertex) => vertex.toString(),
    )
    const points = this.generatePointsFromVertices(mappedVertices)
    this.graph = this.buildGraph(points, voronoiPolygon, width, height)

    this.vertices = []
    this.visited = {}

    const start = this.getStartNode(this.graph, width, height)
    if (start) this.walkNode(start)

    return centerOnOrigin(this.vertices)
  }

  getOptions() {
    return voronoiOptions()
  }

  generatePointsFromVertices(vertices) {
    return vertices.map((vertex) => [vertex.x, vertex.y])
  }
}

mixin(Voronoi, VoronoiMixin)
