import { coterminal, angle, onSegment } from '../../common/Geometry'
import Victor from 'victor'

function perimeterDistance(p, q) {
  const startAngle = angle(p)
  const endAngle = angle(q)
  let deltaAngle = Math.abs(endAngle - startAngle)

  if (deltaAngle > Math.PI) {
    deltaAngle -= 2.0 * Math.PI
  }

  return Math.abs(deltaAngle)
}

// Returns points along the circle from the start to the end, tracing a circle of radius size.
export const traceCircle = (start, end, size) => {
  const startAngle = start.angle()
  const endAngle = end.angle()
  let resolution = (Math.PI*2.0) / 128.0 // 128 segments per circle. Enough?
  let deltaAngle = ((endAngle - startAngle) + 2.0 * Math.PI) % (2.0 * Math.PI)

  if (deltaAngle > Math.PI) {
    deltaAngle -= 2.0 * Math.PI
  }
  if (deltaAngle < 0.0) {
    resolution *= -1.0
  }

  let tracePoints = []
  for (let step = 0; step < (deltaAngle/resolution) ; step++) {
    tracePoints.push(Victor(size * Math.cos(resolution * step + startAngle),
                            size * Math.sin(resolution * step + startAngle)))
  }
  return tracePoints
}

// given a list of segments on the perimeter, starting with the first group,
// walk to the next closest segment and repeat; returns the ordered list of segments.
function minimizePerimeterMoves(segments) {
  let walked = []
  let current = segments.shift()
  let currentIndex

  walked.push(current)
  while (segments.length > 0) {
    // find group that is the shortest distance from our current one
    let minDist = Number.MAX_SAFE_INTEGER
    let prev = current

    /* eslint-disable no-loop-func */
    segments.forEach((group, index) => {
      const dist = Math.min(perimeterDistance(current[current.length-1], group[0]), perimeterDistance(current[current.length-1], group[group.length-1]))

      if (dist < minDist) {
        currentIndex = index
        minDist = dist
      }
    })
    /* eslint-enable no-loop-func */

    // reverse if needed to connect
    current = segments.splice(currentIndex, 1)[0]
    if (perimeterDistance(prev[prev.length-1], current[0]) > perimeterDistance(prev[prev.length-1], current[current.length-1])) {
      current = current.reverse()
    }
    walked.push(current)
  }

  return walked
}

export default class PolarMachine {
  // vertices should be a Victor array
  constructor(vertices, settings) {
    this.vertices = vertices
    this.settings = settings
  }

  polish() {
    return this.addEndpoints()
      .clipAlongPerimeter()
      .cleanVertices()
      .optimizePerimeter()
  }

  // Finds the nearest vertex that is in the bounds of the circle. This will change the shape. i.e. this doesn't
  // care about the line segment, only about the point.
  nearestVertex(vertex) {
    const size = this.settings.maxRadius

    if ( vertex.length() > size) {
      const scale = size / vertex.length()
      return vertex.multiply(new Victor(scale, scale))
    } else {
      return vertex
    }
  }

  addEndpoints() {
    const maxRadius = this.settings.maxRadius

    if (this.settings.polarStartPoint !== 'none') {
      if (this.settings.polarStartPoint === 'center') {
        this.vertices.unshift(new Victor(0.0, 0.0))
      } else {
        const first = this.vertices[0]
        const scale = maxRadius / first.magnitude()
        const startPoint = first.multiply(new Victor(scale, scale))
        this.vertices.unshift(new Victor(startPoint.x, startPoint.y))
      }
    }

    if (this.settings.polarEndPoint !== 'none') {
      if (this.settings.polarEndPoint === 'center') {
        this.vertices.push(new Victor(0.0, 0.0))
      } else {
        const last = this.vertices[this.vertices.length-1]
        const scale = maxRadius / last.magnitude()
        const endPoint = last.multiply(new Victor(scale, scale))
        this.vertices.push(new Victor(endPoint.x, endPoint.y))
      }
    }

    return this
  }

  // Walk the given vertices, clipping as needed along the circle perimeter
  clipAlongPerimeter() {
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

  // This method is the guts of logic for this limits enforcer. It will take a single line (defined by
  // start and end) and if the line goes out of bounds, returns the vertices around the outside edge
  // to follow around without messing up the shape of the vertices.
  //
  clipLine(start, end) {
    // Cases:
    // 1 - Entire line is inside
    //     return start, end
    // 2 - Entire line is outside
    //     trace from start to end
    // 3 - only start is inside
    //     find the intersection
    //     include start
    //     include intersection
    //     trace from intersection to closest to end point
    // 4 - only end is inside
    //     do reverse of 3
    // 4 - Neither end is inside, but there is some line segment inside
    //     find both intersections
    //     trace from start to first intersction
    //     trace from second intersection to end
    const size = this.settings.maxRadius
    const radStart = start.magnitude()
    const radEnd = end.magnitude()

    if (radStart <= size && radEnd <= size) {
      // The whole segment is inside
      return [start, end]
    }

    // Check for the odd case of coincident points
    if (start.distance(end) < 0.00001) {
       return [this.nearestVertex(start)]
    }

    let intersections = this.getIntersections(start, end)
    if (!intersections.intersection) {
      // The whole line is outside, just trace.
      return this.traceCircle(start, end)
    }

    // if neither point is on the segment, then it should just be a trace
    if (!intersections.points[0].on && ! intersections.points[1].on) {
      return this.traceCircle(start, end)
    }

    // If both points are outside, but there's an intersection
    if (radStart > size + 1.0e-9 && radEnd > size + 1.0e-9) {
      let point = intersections.points[0].point
      let otherPoint = intersections.points[1].point

      return [
        ...this.traceCircle(start, point),
        point,
        ...this.traceCircle(otherPoint, end)
      ]
    }

    // If we're here, then one point is still in the circle.
    if (radStart <= size) {
      let point1 = (intersections.points[0].on && Math.abs(intersections.points[0].point - start) > 0.0001) ? intersections.points[0].point : intersections.points[1].point

      return [
        start,
        ...this.traceCircle(point1, end),
        end
      ]
    } else {
      const point1 = intersections.points[0].on ? intersections.points[0].point : intersections.points[1].point

      return [
        ...this.traceCircle(start, point1),
        point1,
        end
      ]
    }
  }

  // Just for sanity, and cases that I haven't thought of, clean this list again, including removing
  // duplicate points
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

  // strip out unnecessary/redundant perimeter moves
  optimizePerimeter() {
    let segments = this.removeExtraPerimeterMoves()

    if (this.settings.minimizeMoves) {
      segments = minimizePerimeterMoves(segments)
    }

    // connect the segments together
    let connectedVertices = []
    for (let j=0; j<segments.length; j++) {
      const current = segments[j]

      if (j > 0) {
        // connect the two segments along the circle perimeter
        const prev = segments[j-1]
        connectedVertices.push(this.traceCircle(prev[prev.length-1], current[0]))
      }
      connectedVertices.push(current)
    }

    this.vertices = connectedVertices.flat()
    return this
  }

  // Removes extra perimeter moves out of a given list of vertices, and returns
  // an array of non-contiguous segments representing the valid perimeter
  // vertices that are left.
  removeExtraPerimeterMoves = function() {
    let segments = []
    let segment = {vertices: []}
    let cutting = false
    let start, startAngle

    for (let i=0; i<this.vertices.length; i++) {
      const v = this.vertices[i]
      const dDelta = 15
      const d = (i === 0) ? 1 : Math.abs(this.vertices[i-1].distance(v))

      if (!this.onPerimeter(v) || d > dDelta) {
        segment.vertices.push(v)
        cutting = false
      } else {
        if (!cutting) {
          segment.vertices.push(v)
          segments.push(segment)
          segment = {vertices: []}
          cutting = true
        } else { // walking along perimeter
          if (segment.vertices.length === 0) {
            segment.vertices = [v]
            start = v
            startAngle = coterminal(start.angle())
          } else {
            const delta = v.angle() - start.angle()

            if (!segment.direction) {
              segment.direction = Math.sign(delta)
              segment.vertices = [v] // update our vertex
            } else {
              const endAngle = coterminal(v.angle())
              if (endAngle * segment.direction >= startAngle * segment.direction) {
                segment.vertices = [v] // update our vertex
              } else {
                // moved past starting vertex discard vertex group as it is full of empty moves
                segment = {vertices: [v]}
                start = v
                startAngle = coterminal(start.angle())
              }
            }
          }
        }
      }
    }

    if (segment.vertices.length > 0) {
      segments.push(segment)
    }

    return segments.map((group) => group.vertices)
  }

  // Returns points along the circle from the start to the end, tracing a circle of radius size.
  traceCircle(start, end) {
    return traceCircle(start, end, this.settings.maxRadius)
  }

  getIntersections(start, end) {
    const size = this.settings.maxRadius
    let direction = end.clone().subtract(start).clone().normalize()
    let t = direction.x * -1.0 * start.x + direction.y * -1.0 * start.y
    let e = direction.clone().multiply(Victor(t,t)).add(start)
    let distanceToLine = e.magnitude()

    if (distanceToLine >= size) {
      return {
        intersection: false,
        points: [],
      }
    }

    let dt = Math.sqrt(size*size - distanceToLine*distanceToLine)
    let point1 = direction.clone().multiply(Victor(t - dt,t - dt)).add(start)
    let point2 = direction.clone().multiply(Victor(t + dt,t + dt)).add(start)

    return {
      intersection: true,
      points: [
        {
          point: point1,
          on: onSegment(start, end, point1),
        },
        {
          point: point2,
          on: onSegment(start, end, point2),
        }
      ]}
  }

  onPerimeter(v, delta=.001) {
    let r = Math.pow(v.x, 2) + Math.pow(v.y, 2)
    return r >= Math.pow(this.settings.maxRadius, 2) - delta
  }
}
