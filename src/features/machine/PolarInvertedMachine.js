import PolarMachine from './PolarMachine'
import Victor from 'victor'

// Machine that clips vertices that fall inside the machine limits
export default class PolarInvertedMachine extends PolarMachine {
  constructor(vertices, settings, layerInfo={}) {
    super(vertices, settings, layerInfo)
  }

  // Walk the given vertices, clipping as needed along the perimeter
  enforceLimits() {
    return this.enforceInvertedLimits()
  }

  // Finds the nearest vertex that is in the bounds of the circle. This will change the
  // shape. i.e. this doesn't care about the line segment, only about the point.
  nearestVertex(vertex) {
    const size = this.settings.maxRadius

    if ( vertex.length() < size) {
      const scale = size / vertex.length()
      return vertex.multiply(new Victor(scale, scale))
    } else {
      return vertex
    }
  }

  // Take a given line, and if the line goes out of bounds, returns the vertices
  // around the outside edge to follow around without messing up the shape of the vertices.
  clipLine(start, end, log=false) {
    const size = this.settings.maxRadius
    const radStart = start.magnitude()
    const radEnd = end.magnitude()

    if (radStart < size && radEnd < size) {
      if (log) { console.log('line is inside limits') }
      return []
    }

    const intersections = this.getIntersections(start, end)
    if (!intersections.intersection) {
      if (log) { console.log('line is outside limits') }
      return [end]
    }

    if (intersections.points[0].on && intersections.points[1].on) {
      let point = intersections.points[0].point
      let otherPoint = intersections.points[1].point

      if (log) { console.log('line is outside limits, but intersects within limits') }
      return [
        ...this.tracePerimeter(point, otherPoint),
        otherPoint,
        end
      ]
    }

    if (radStart <= size) {
      const point1 = (intersections.points[0].on && Math.abs(intersections.points[0].point - start) > 0.0001) ? intersections.points[0].point : intersections.points[1].point
      if (log) { console.log('start is inside limits') }
      return [ point1, end ]
    } else {
      const point1 = intersections.points[0].on ? intersections.points[0].point : intersections.points[1].point
      if (log) { console.log('end is inside limits') }
      return [ start, point1 ]
    }
  }

  // Returns the vertex if it's outside the bounds of the circle.
  inBounds(vertex) {
    return vertex.length() < this.settings.maxRadius
  }
}
