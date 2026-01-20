import { vertexRoundP, annotateVertices, downsample } from "@/common/geometry"

export const machineOptions = {
  name: {
    title: "Name",
    type: "text",
    isEnabled: (model, state) => !state.imported,
  },
  minimizeMoves: {
    title: "Minimize perimeter moves",
    type: "checkbox",
  },
}

// inherit all machine classes from this base class
export default class Machine {
  constructor(state) {
    this.state = Object.keys(state).length < 2 ? this.getInitialState() : state
    this.type = this.state.type
    this.label = "Machine"
  }

  // override as needed; redux state of a newly created instance
  getInitialState() {
    return {
      name: "default machine",
      minimizeMoves: false,
      imported: false,
    }
  }

  // override as needed
  getOptions() {
    return machineOptions
  }

  // given a set of vertices, ensure they adhere to the limits defined by the machine
  polish(vertices, layerInfo = {}) {
    this.vertices = vertices
    this.layerInfo = layerInfo

    this.enforceLimits().cleanVertices().limitPrecision().optimizePerimeter()
    if (this.layerInfo.border) this.outlinePerimeter()
    if (this.layerInfo.start) this.addStartPoint()
    if (this.layerInfo.end) this.addEndPoint()

    // remove unnecessary vertices along a straight line; the polar machine, for one, adds
    // extra vertices to help with perimeter detection
    this.vertices = downsample(this.vertices)

    // second call to limit precision for final cleanup
    this.limitPrecision()

    return this.vertices
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
        const line = annotateVertices(this.clipSegment(previous, vertex), {
          connect: vertex.connect,
        })

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

    if (this.state.minimizeMoves) {
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
          annotateVertices(
            this.tracePerimeter(prev[prev.length - 1], current[0]),
            { connect: prev[prev.length - 1].connect },
          ),
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

  // Orders segments to minimize perimeter travel distance using greedy nearest-neighbor.
  // Complexity: O(n log n) for sorting + O(n log n) for n binary searches.
  minimizePerimeterMoves(segments) {
    if (segments.length <= 2) {
      return segments
    }

    const walked = []
    let current = segments.shift()
    let lastSegment

    if (segments.length > 0) {
      lastSegment = segments.pop()
    }

    // Build sorted index of segment endpoints
    const perimeterLength = this.getPerimeterLength()
    const endpoints = []
    segments.forEach((segment, index) => {
      endpoints.push({
        pos: this.getPerimeterPosition(segment[0]),
        segIndex: index,
        isEnd: false,
      })
      endpoints.push({
        pos: this.getPerimeterPosition(segment[segment.length - 1]),
        segIndex: index,
        isEnd: true,
      })
    })
    endpoints.sort((a, b) => a.pos - b.pos)

    const used = new Set()
    walked.push(current)

    while (used.size < segments.length) {
      const currentPos = this.getPerimeterPosition(current[current.length - 1])

      // Binary search to find insertion point
      let lo = 0,
        hi = endpoints.length
      while (lo < hi) {
        const mid = (lo + hi) >> 1
        if (endpoints[mid].pos < currentPos) lo = mid + 1
        else hi = mid
      }

      // Scan outward from insertion point to find nearest unused segment
      let bestSegIndex = -1
      let bestDist = Number.MAX_SAFE_INTEGER
      let left = lo - 1,
        right = lo

      while (bestSegIndex === -1 || left >= 0 || right < endpoints.length) {
        // Check right
        if (right < endpoints.length) {
          const ep = endpoints[right]
          if (!used.has(ep.segIndex)) {
            let dist = ep.pos - currentPos
            if (dist < 0) dist += perimeterLength
            if (dist < bestDist) {
              bestDist = dist
              bestSegIndex = ep.segIndex
            }
            if (dist >= bestDist && bestSegIndex !== -1) {
              right = endpoints.length // stop searching right
            }
          }
          right++
        }

        // Check left
        if (left >= 0) {
          const ep = endpoints[left]
          if (!used.has(ep.segIndex)) {
            let dist = currentPos - ep.pos
            if (dist < 0) dist += perimeterLength
            if (dist < bestDist) {
              bestDist = dist
              bestSegIndex = ep.segIndex
            }
            if (dist >= bestDist && bestSegIndex !== -1) {
              left = -1 // stop searching left
            }
          }
          left--
        }

        // Early exit if we've found a segment and searched far enough
        if (bestSegIndex !== -1 && left < 0 && right >= endpoints.length) {
          break
        }
      }

      // Mark segment as used and add to walked
      used.add(bestSegIndex)
      const prev = current
      current = segments[bestSegIndex]

      // Reverse if needed to connect closer endpoint
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
    this.vertices.forEach((vertex) => vertexRoundP(vertex, 3))
    return this
  }
}
