import { vertexRoundP } from '../../common/geometry'

// base machine class
export default class Machine {
  polish() {
    return this.enforceLimits()
      .cleanVertices()
      .limitPrecision()
      .optimizePerimeter()
      .addEndpoints()
  }

  // clean the list of vertices and remove duplicate points
  cleanVertices() {
    let previous = null
    let cleanVertices = []

    for (let i=0; i<this.vertices.length; i++) {
      if (previous) {
        let start = this.vertices[i]
        let end = previous

        if (start.distance(end) > 0.001) {
          cleanVertices.push(this.nearestVertex(this.vertices[i]))
        }
      } else {
        cleanVertices.push(this.nearestVertex(this.vertices[i]))
      }
      previous = this.vertices[i]
    }

    this.vertices = cleanVertices
    return this
  }

  // walk the given vertices, clipping as needed along the circle perimeter
  enforceLimits() {
    let cleanVertices = []
    let previous = null

    for (let next=0; next<this.vertices.length; next++) {
      const vertex = this.vertices[next]

      if (previous) {
        const line = this.clipLine(previous, vertex)

        for (let pt=0; pt<line.length; pt++) {
          if (line[pt] !== previous) {
            cleanVertices.push(line[pt])
          }
        }
      } else {
        cleanVertices.push(this.nearestVertex(vertex))
      }

      previous = vertex
    }

    this.vertices = cleanVertices
    return this
  }

  // strip out unnecessary/redundant perimeter moves
  optimizePerimeter() {
    let segments = this.stripExtraPerimeterVertices()

    if (this.settings.minimizeMoves) {
      segments = this.minimizePerimeterMoves(segments)
    }

    // connect the segments together
    let connectedVertices = []
    for (let j=0; j<segments.length; j++) {
      const current = segments[j]

      if (j > 0) {
        // connect the two segments along the circle perimeter
        const prev = segments[j-1]
        connectedVertices.push(this.tracePerimeter(prev[prev.length-1], current[0]))
      }
      connectedVertices.push(current)
    }

    this.vertices = connectedVertices.flat()
    return this
  }

  // remove all non-essential perimeter vertices. returns a list of segments
  // involving non-perimeter paths
  stripExtraPerimeterVertices() {
    let segments = []
    let segment = []
    let perimeter = null

    for (let i=0; i<this.vertices.length; i++) {
      const curr = this.vertices[i]
      const prev = this.vertices[i-1]

      if (!prev || !this.onPerimeter(curr, prev)) {
        if (perimeter) { segment.push(perimeter) }
        segment.push(curr)
        perimeter = null
      } else {
        if (!perimeter) {
          segments.push(segment)
          segment = []
        }
        perimeter = curr
      }
    }

    if (segment.length > 0) {
      segments.push(segment)
    }

    return segments
  }

  // primitive O(n^2) algorithm that orders segments to try to minimize the distance traveled
  minimizePerimeterMoves(segments) {
    let walked = []
    let current = segments.shift()
    let currentIndex
    let lastSegment

    if (segments.length > 0) {
      // reserve the last segment to ensure we don't draw an invalid line connecting
      // to it
      lastSegment = segments.pop()
    }

    walked.push(current)
    while (segments.length > 0) {
      // find segment that is the shortest distance from our current one
      let minDist = Number.MAX_SAFE_INTEGER
      let prev = current

      /* eslint-disable no-loop-func */
      segments.forEach((segment, index) => {
        const dist = Math.min(
          this.perimeterDistance(current[current.length-1], segment[0]),
          this.perimeterDistance(current[current.length-1], segment[segment.length-1])
        )

        if (dist < minDist) {
          currentIndex = index
          minDist = dist
        }
      })
      /* eslint-enable no-loop-func */

      // reverse if needed to connect
      current = segments.splice(currentIndex, 1)[0]
      if (this.perimeterDistance(prev[prev.length-1], current[0]) > this.perimeterDistance(prev[prev.length-1], current[current.length-1])) {
        current = current.reverse()
      }
      walked.push(current)
    }

    if (lastSegment) {
      walked.push(lastSegment)
    }

    return walked
  }

  // round each vertex to the nearest .001. This eliminates floating point
  // math errors and allows us to do accurate equality comparisons.
  limitPrecision() {
    this.vertices = this.vertices.map(vertex => vertexRoundP(vertex, 3))
    return this
  }
}
