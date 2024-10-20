import seedrandom from "seedrandom"
import noise from "@/common/noise"
import { mixin } from "@/common/util"
import { centerOnOrigin } from "@/common/geometry"
import { getMachine } from "@/features/machines/machineFactory"
import { VoronoiMixin, weightFunctions } from "@/common/voronoi"
import Shape from "./Shape"

export const voronoiOptions = {
  voronoiPlacement: {
    title: "Placement",
    type: "togglebutton",
    choices: ["weighted", "poisson disk sampling"],
  },
  voronoiPolygon: {
    title: "Polygon",
    type: "togglebutton",
    choices: ["voronoi", "delaunay"],
  },
  voronoiWeightFunction: {
    title: "Weight function",
    type: "dropdown",
    choices: () => {
      return Object.keys(weightFunctions)
    },
    isVisible: (layer, state) => {
      return state.voronoiPlacement === "weighted"
    },
  },
  voronoiZoom: {
    title: "Zoom",
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
    title: "Number of points",
    min: 1,
    step: 1,
    randomMax: 200,
    isVisible: (layer, state) => {
      return state.voronoiPlacement === "weighted"
    },
  },
  voronoiMinDistance: {
    title: "Min. distance",
    type: "slider",
    min: 20,
    max: 50,
    isVisible: (layer, state) => {
      return state.voronoiPlacement === "poisson disk sampling"
    },
  },
  voronoiMaxDistance: {
    title: "Max. distance",
    type: "slider",
    min: 20,
    max: 50,
    isVisible: (layer, state) => {
      return state.voronoiPlacement === "poisson disk sampling"
    },
  },
  voronoiFrequency: {
    title: "Wave frequency",
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
    title: "Random seed",
    min: 1,
    randomMax: 1000,
  },
}

export default class Voronoi extends Shape {
  constructor() {
    super("voronoi")
    this.label = "Voronoi"
    this.description =
      "A Voronoi diagram divides a space into regions based on a set of seed points. Each region contains all the points that are closer to its seed point than to any other seed point."
    this.link = "https://en.wikipedia.org/wiki/Voronoi_diagram"
    this.linkText = "Wikipedia"
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
