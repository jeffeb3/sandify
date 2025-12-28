import seedrandom from "seedrandom"
import noise from "@/common/noise"
import { mixin } from "@/common/util"
import { centerOnOrigin } from "@/common/geometry"
import { getMachine } from "@/features/machines/machineFactory"
import { VoronoiMixin, weightFunctions } from "@/common/voronoi"
import Shape from "./Shape"
import i18next from 'i18next'

export const voronoiOptions = {
  voronoiPlacement: {
    title: i18next.t('shapes.voronoi.placement'),
    type: "togglebutton",
    choices: [
      {"title": i18next.t('shapes.voronoi.weighted'), "value": "weighted"},
      {"title": i18next.t('shapes.voronoi.poissonDiskSampling'), "value": "poisson disk sampling"}
    ],
  },
  voronoiPolygon: {
    title: i18next.t('shapes.voronoi.polygon'),
    type: "togglebutton",
    choices: [
      {"title": i18next.t('shapes.voronoi.voronoiDiagram'), "value": "voronoi"},
      {"title": i18next.t('shapes.voronoi.delaunay'), "value": "delaunay"}
    ],
  },
  voronoiWeightFunction: {
    title: i18next.t('shapes.voronoi.weightFunction'),
    type: "dropdown",
    choices: () => {
      return Object.keys(weightFunctions)
    },
    isVisible: (layer, state) => {
      return state.voronoiPlacement === "weighted"
    },
  },
  voronoiZoom: {
    title: i18next.t('shapes.voronoi.zoom'),
    min: 1,
    step: 1,
    randomMax: 200,
    isVisible: (layer, state) => {
      return !(
        state.voronoiPlacement === "weighted" &&
        state.voronoiWeightFunction == "equal"
      )
    },
  },
  voronoiNumPoints: {
    title: i18next.t('shapes.voronoi.numberOfPoints'),
    min: 1,
    step: 1,
    randomMax: 200,
    isVisible: (layer, state) => {
      return state.voronoiPlacement === "weighted"
    },
  },
  voronoiMinDistance: {
    title: i18next.t('shapes.voronoi.minDistance'),
    type: "slider",
    min: 20,
    max: 50,
    isVisible: (layer, state) => {
      return state.voronoiPlacement === "poisson disk sampling"
    },
  },
  voronoiMaxDistance: {
    title: i18next.t('shapes.voronoi.maxDistance'),
    type: "slider",
    min: 20,
    max: 50,
    isVisible: (layer, state) => {
      return state.voronoiPlacement === "poisson disk sampling"
    },
  },
  voronoiFrequency: {
    title: i18next.t('shapes.voronoi.waveFrequency'),
    min: 1,
    max: 100,
    isVisible: (layer, state) => {
      return (
        state.voronoiPlacement === "weighted" &&
        state.voronoiWeightFunction === "wave"
      )
    },
  },
  seed: {
    title: i18next.t('shapes.voronoi.randomSeed'),
    min: 1,
    randomMax: 1000,
  },
}

export default class Voronoi extends Shape {
  constructor() {
    super("voronoi")
    this.label = i18next.t('shapes.voronoi.voronoi')
    this.description = i18next.t('shapes.voronoi.description')
    this.link = "https://en.wikipedia.org/wiki/Voronoi_diagram"
    this.linkText = i18next.t('shapes.voronoi.linkText')
    this.usesMachine = true
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        voronoiNumPoints: 300,
        voronoiPolygon: "voronoi",
        voronoiWeightFunction: "equal",
        voronoiZoom: 1,
        voronoiPlacement: "weighted",
        voronoiMinDistance: 30,
        voronoiMaxDistance: 50,
        voronoiFrequency: 5,
        seed: 1,
      },
    }
  }

  initialDimensions(props) {
    if (!props) {
      // undefined during import integrity checks
      return {
        width: 0,
        height: 0,
        aspectRatio: 1,
      }
    }

    const machine = getMachine(props.machine)

    // default to 60% of machine size
    return {
      width: machine.width * 0.6,
      height: machine.height * 0.6,
    }
  }

  getVertices(state) {
    const {
      seed,
      voronoiNumPoints,
      voronoiPlacement,
      voronoiPolygon,
      voronoiZoom,
    } = state.shape
    const width =
      voronoiPlacement == "poisson disk sampling"
        ? 100 * (2 + voronoiZoom)
        : 100
    const height =
      voronoiPlacement == "poisson disk sampling"
        ? 100 * (2 + voronoiZoom)
        : 100

    if (voronoiNumPoints == 0) return [] // safeguard

    this.rng = seedrandom(seed)
    noise.seed(seed)

    const points = this.generatePoints(state.shape)
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
}

mixin(Voronoi, VoronoiMixin)
