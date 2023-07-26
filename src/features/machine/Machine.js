import { vertexRoundP } from "@/common/geometry"

// inherit all machine classes from this base class
export default class Machine {
  // given a set of vertices, ensure they adhere to the limits defined by the machine
  polish() {
    this.enforceLimits().cleanVertices().limitPrecision().optimizePerimeter()

    if (this.layerInfo.border) this.outlinePerimeter()
    if (this.layerInfo.start) this.addStartPoint()
    if (this.layerInfo.end) this.addEndPoint()

    // second call to limit precision for final cleanup
    return this.limitPrecision()
  }

  // clean the list of vertices and remove (nearly) duplicate points
  cleanVertices() {
    let previous = null
    let cleanVertices = []

    for (let i = 0; i < this.vertices.length; i++) {
      const curr = this.vertices[i]

      if (previous) {
        if (curr.distance(previous) > 0.001) {
          cleanVertices.push(curr)
        }
      } else {
        cleanVertices.push(curr)
      }

      previous = this.vertices[i]
    }

    this.vertices = cleanVertices
    return this
  }

  // Walk the given vertices, removing all vertices that lie outside of the machine limits
  enforceLimits() {
    let cleanVertices = []
    let previous = null

    for (let next = 0; next < this.vertices.length; next++) {
      const vertex = this.vertices[next]

      if (previous) {
        const line = this.clipSegment(previous, vertex)

        for (let pt = 0; pt < line.length; pt++) {
          if (line[pt] !== previous) {
            cleanVertices.push(this.nearestVertex(line[pt]))
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

  // walk the given vertices, removing all vertices that lie within the machine limits
  enforceInvertedLimits() {
    if (this.vertices.length === 0) return this

    let cleanVertices = []
    let currentIndex = 0
    let curr = this.vertices[0]
    let previous

    // we may be starting inside bounds, in which case we only care about the
    // last inside vertex
    while (currentIndex < this.vertices.length && this.inBounds(curr)) {
      currentIndex = currentIndex + 1
      previous = curr
      curr = this.vertices[currentIndex]
    }

    while (currentIndex < this.vertices.length) {
      curr = this.vertices[currentIndex]

      if (previous) {
        // rounding here to deal with some erratic perimeter lines
        let clipped = this.clipSegment(previous, curr).map((pt) =>
          vertexRoundP(pt, 3),
        )

        if (
          clipped.length > 0 &&
          this.inBounds(previous) &&
          cleanVertices.length > 0
        ) {
          const perimeter = this.tracePerimeter(
            cleanVertices[cleanVertices.length - 1],
            clipped[0],
          )
          cleanVertices = [...cleanVertices, ...perimeter]
        }

        // slightly awkward syntax so that we can use splice to add our clipped
        // array directly to cleanVertices and avoid a shallow array copy.
        const args = [cleanVertices.length, 0].concat(clipped)
        Array.prototype.splice.apply(cleanVertices, args)
      } else {
        cleanVertices.push(curr)
      }

      previous = curr
      currentIndex = currentIndex + 1
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
    for (let j = 0; j < segments.length; j++) {
      const current = segments[j]

      if (j > 0) {
        // connect the two segments along the perimeter
        const prev = segments[j - 1]
        connectedVertices.push(
          this.tracePerimeter(prev[prev.length - 1], current[0]),
        )
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

    for (let i = 0; i < this.vertices.length; i++) {
      const curr = this.vertices[i]
      const prev = this.vertices[i - 1]

      if (!prev || !this.onPerimeter(curr, prev)) {
        if (perimeter) {
          segment.push(perimeter)
        }
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
          this.perimeterDistance(current[current.length - 1], segment[0]),
          this.perimeterDistance(
            current[current.length - 1],
            segment[segment.length - 1],
          ),
        )

        if (dist < minDist) {
          currentIndex = index
          minDist = dist
        }
      })
      /* eslint-enable no-loop-func */

      // reverse if needed to connect
      current = segments.splice(currentIndex, 1)[0]
      if (
        this.perimeterDistance(prev[prev.length - 1], current[0]) >
        this.perimeterDistance(
          prev[prev.length - 1],
          current[current.length - 1],
        )
      ) {
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
    this.vertices = this.vertices.map((vertex) => vertexRoundP(vertex, 3))
    return this
  }
}
