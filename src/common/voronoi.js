import noise from "@/common/noise"
import Graph, { edgeKey } from "@/common/Graph"
import { cloneVertex, cloneVertices } from "@/common/geometry"
import seedrandom from "seedrandom"
import { Delaunay } from "d3-delaunay"
import PoissonDiskSampling from "poisson-disk-sampling"
import Victor from "victor"

function linearWeight(i, seed, numPoints, options) {
  return 1 + (2 * i) / (numPoints * options.voronoiZoom)
}

function zeroWeight(i) {
  return 1
}

function randomWeight(i, seed) {
  return seed()
}

function exponentialWeight(i, seed, numPoints, options) {
  return Math.exp(i / (0.15 * options.voronoiZoom * numPoints))
}

function inverseWeight(i, seed, numPoints, options) {
  return 1 / (0.0001 * numPoints * i * options.voronoiZoom + 5)
}

function logarithmicWeight(points, width, height, options) {
  const centerX = width / 2
  const centerY = height / 2

  const weightedPoints = points.map((point) => {
    const dx = point[0] - centerX
    const dy = point[1] - centerY
    const distance = Math.sqrt(dx * dx + dy * dy)
    const decay = (options.voronoiZoom + 5) / 250
    const weight = Math.log(distance + 1) * Math.exp(-decay * distance)

    return [centerX + dx * weight, centerY + dy * weight]
  })

  return weightedPoints
}

function centerDistanceWeight(points, width, height, options) {
  const centerX = width / 2
  const centerY = height / 2

  return points.map(([x, y]) => {
    const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2)
    const maxDistance = Math.sqrt((width / 2) ** 2 + (height / 2) ** 2)
    const weight = 1 - distance / maxDistance // larger weight closer to center

    // pull points toward center based on weight
    const newX = x + (centerX - x) * weight * (1 + options.voronoiZoom / 4)
    const newY = y + (centerY - y) * weight * (1 + options.voronoiZoom / 4)

    return [newX, newY]
  })
}

function radialGradientWeight(points, width, height, options) {
  const rng = seedrandom(options.seed)
  const centerX = width / 2
  const centerY = height / 2

  return points.map(([x, y]) => {
    const angle = Math.atan2(y - centerY, x - centerX)
    const weight = (angle + Math.PI) / (2 * Math.PI) // normalize
    const noiseFactor = rng() * 0.8 - 0.1 // between -0.1 and 0.1
    const modifiedWeight = Math.min(Math.max(weight + noiseFactor, 0), 1)
    const modifiedZoom = options.voronoiZoom / 3

    // spread points more as weight increases
    const newX = x + (centerX - x) * (1 - modifiedWeight * modifiedZoom)
    const newY = y + (centerY - y) * (1 - modifiedWeight * modifiedZoom)

    return [newX, newY]
  })
}

function noiseWeight(points, width, height, noiseFn, options) {
  return points.map(([x, y]) => {
    const nx = x / width
    const ny = y / height
    const weight = noiseFn(nx, ny)

    const newX = x + x * weight * options.voronoiZoom
    const newY = y + y * weight * options.voronoiZoom

    return [newX, newY]
  })
}

function simplexNoiseWeight(points, width, height, options) {
  return noiseWeight(points, width, height, noise.simplex2, options)
}

function perlinNoiseWeight(points, width, height, options) {
  return noiseWeight(points, width, height, noise.perlin2, options)
}

function wavePatternWeight(points, width, height, options) {
  const frequency = options.voronoiFrequency + 3
  const zoom = (options.voronoiZoom + 2) / 4

  return points.map(([x, y]) => {
    const weight =
      0.5 + 0.5 * Math.sin((x / width) * frequency + (y / height) * frequency)

    const newX = x * (1 + weight * zoom)
    const newY = y * (1 + weight * zoom)

    return [newX, newY]
  })
}

function densityWeight(points, width, height, options) {
  return points.map((point, i) => {
    const [x, y] = point
    let nearestDistance = Infinity

    points.forEach((otherPoint, j) => {
      if (i !== j) {
        const [x2, y2] = otherPoint
        const distance = Math.sqrt((x - x2) ** 2 + (y - y2) ** 2)
        nearestDistance = Math.min(nearestDistance, distance)
      }
    })

    const weight = nearestDistance // larger distances (sparser areas) get higher weight

    // spread points more if they're in dense areas
    const newX = x * (1 + (weight * options.voronoiZoom) / 10)
    const newY = y * (1 + (weight * options.voronoiZoom) / 10)

    return [newX, newY]
  })
}

export const weightFunctions = {
  equal: zeroWeight,
  center: true,
  density: true,
  exponential: exponentialWeight,
  inverse: inverseWeight,
  linear: linearWeight,
  log: true,
  radial: true,
  random: randomWeight,
  perlin: true,
  simplex: true,
  wave: true,
}

export const calculatedWeightFunctions = {
  center: centerDistanceWeight,
  density: densityWeight,
  log: logarithmicWeight,
  perlin: perlinNoiseWeight,
  radial: radialGradientWeight,
  simplex: simplexNoiseWeight,
  wave: wavePatternWeight,
}

export const calculatedWeightFunctionNames = Object.keys(
  calculatedWeightFunctions,
)

export class VoronoiMixin {
  buildGraph(points, polygonType, width, height) {
    const graph = new Graph()
    const delaunay = Delaunay.from(points)

    let iterator
    if (polygonType == "voronoi") {
      const voronoi = delaunay.voronoi([0, 0, width, height])
      iterator = voronoi.cellPolygons()
    } else {
      iterator = delaunay.trianglePolygons()
    }

    for (const polygon of iterator) {
      polygon.forEach((v1, i) => {
        const node1 = new Victor(v1[0], v1[1])

        if (i == 0) {
          graph.addNode(node1)
        }

        if (i < polygon.length - 1) {
          const v2 = polygon[i + 1]
          const node2 = new Victor(v2[0], v2[1])
          graph.addNode(node2)
          graph.addEdge(node1, node2)
        }
      })
    }

    return graph
  }

  walkNode(curr, prev) {
    this.vertices.push(cloneVertex(curr))

    this.graph.neighbors(curr).forEach((neighbor) => {
      const key = edgeKey(curr, neighbor)
      const visited = this.visited[key]

      if (!visited) {
        if (prev) {
          const path = this.graph.dijkstraShortestPath(
            prev.toString(),
            neighbor.toString(),
          )
          this.vertices.push(...cloneVertices(path).slice(1, -1))
          prev = null
        } else {
          this.visited[key] = true
        }
        prev = this.walkNode(neighbor, prev)
      }
    })

    return prev || curr
  }

  generatePoints(options) {
    const {
      voronoiNumPoints,
      voronoiWeightFunction,
      voronoiPlacement,
      voronoiMinDistance,
      voronoiMaxDistance,
      voronoiZoom,
    } = options
    const width =
      voronoiPlacement == "poisson disk sampling"
        ? 100 * (2 + voronoiZoom)
        : 100
    const height =
      voronoiPlacement == "poisson disk sampling"
        ? 100 * (2 + voronoiZoom)
        : 100

    let points

    if (voronoiPlacement == "weighted") {
      if (calculatedWeightFunctionNames.includes(voronoiWeightFunction)) {
        points = calculatedWeightFunctions[voronoiWeightFunction](
          this.generateRandomPoints(voronoiNumPoints, width, height),
          width,
          height,
          options,
        )
      } else {
        points = this.generateWeightedPoints(
          voronoiNumPoints,
          width,
          height,
          weightFunctions[voronoiWeightFunction],
          options,
        )
      }
    } else {
      points = this.generatePoissonDiscPoints(width, height, {
        minDistance: voronoiMinDistance,
        maxDistance: voronoiMaxDistance,
      })
    }

    return points
  }

  generateWeightedPoints(num, width, height, weightFunction, options) {
    const weights = Array.from({ length: num }, (_, i) =>
      weightFunction(i, this.rng, num, options),
    )
    const maxWeight = Math.max(...weights)

    return weights.map((weight) => {
      const normalizedWeight = weight / maxWeight
      const x = this.rng() * width
      const y = this.rng() * height

      // adjust position slightly by clustering factor (e.g., pulling the point toward the center)
      const xOffset = (x - width / 2) * (1 - normalizedWeight)
      const yOffset = (y - height / 2) * (1 - normalizedWeight)

      return [x - xOffset, y - yOffset]
    })
  }

  generateRandomPoints(num, width, height) {
    return Array.from({ length: num }, () => [
      this.rng() * width,
      this.rng() * height,
    ])
  }

  generatePoissonDiscPoints(width, height, options = {}) {
    const pds = new PoissonDiskSampling(
      {
        shape: [width, height],
        tries: 30,
        ...options,
      },
      this.rng,
    )

    const points = pds.fill()

    return points
  }

  getStartNode(graph, width, height) {
    let closestNode = null
    let closestDistance = Infinity

    const distanceToEdge = (node) => {
      const vDist = Math.min(Math.abs(node.x), Math.abs(node.x - width))
      const hDist = Math.min(Math.abs(node.y), Math.abs(node.y - height))
      return Math.min(hDist, vDist)
    }

    const onEdge = (node) => {
      const distance = distanceToEdge(node)

      if (distanceToEdge(node) < closestDistance) {
        closestDistance = distance
        closestNode = node
      }

      return Math.abs(node.x) == width || Math.abs(node.y) == height
    }

    return graph.findNode(onEdge) || closestNode
  }
}
