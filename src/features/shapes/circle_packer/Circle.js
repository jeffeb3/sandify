import Victor from "victor"

export class Circle extends Victor {
  constructor(x, y, r, state) {
    super(x, y)
    this.x = x
    this.y = y
    this.r = r || 30
    this.state = state
    this.growing = this.state.growing
    if (this.growing == null) {
      this.growing = true
    }
    this.theta = null
    this.center = new Victor(0, 0)
  }

  grow() {
    if (this.growing) {
      this.r += 1
      this.perimeter = this.outOfBounds(this.r)
    }
  }

  outOfBounds(radius) {
    radius ||= this.state.inBounds ? this.r : 0
    return this.state.rectangular
      ? this.outOfRectangularBounds(radius)
      : this.outOfPolarBounds(radius)
  }

  outOfPolarBounds(radius) {
    return this.state.maxRadius <= this.distance(this.center) + radius
  }

  outOfRectangularBounds(radius) {
    // setting theta as the angle of intersection with our bounds
    if (this.x + radius > this.state.width / 2) {
      return true
    } else if (this.x - radius < -this.state.width / 2) {
      return true
    } else if (this.y + radius > this.state.height / 2) {
      return true
    } else if (this.y - radius < -this.state.height / 2) {
      return true
    }

    return false
  }

  // returns points of intersection between this circle and a given circle
  intersection(circle) {
    let a = circle.r
    var b = this.r
    var c = Math.sqrt(
      (this.x - circle.x) * (this.x - circle.x) +
        (this.y - circle.y) * (this.y - circle.y),
    )
    var d = (b * b + c * c - a * a) / (2 * c)
    var h = Math.sqrt(b * b - d * d)
    const i1 =
      ((circle.x - this.x) * d) / c + ((circle.y - this.y) * h) / c + this.x
    const i2 =
      ((circle.y - this.y) * d) / c - ((circle.x - this.x) * h) / c + this.y
    const i3 =
      ((circle.x - this.x) * d) / c - ((circle.y - this.y) * h) / c + this.x
    const i4 =
      ((circle.y - this.y) * d) / c + ((circle.x - this.x) * h) / c + this.y
    const ret = []

    if (!isNaN(i1)) {
      ret.push(new Victor(i1, i2))
    }
    if (!isNaN(i3)) {
      ret.push(new Victor(i3, i4))
    }

    return ret
  }

  // Returns points of intersection between this circle and a line defined by two points
  // Adapted from https://cscheng.info/2016/06/09/calculate-circle-line-intersection-with-javascript-and-p5js.html. No license was specified.
  // Added a special case for vertical lines not included in original algorithm.
  lineIntersection(p1, p2) {
    // circle: (x - h)^2 + (y - k)^2 = r^2
    // h: this.x
    // k: this.y
    // line: y = m * x + n
    // r: this.r
    // m: slope
    // n: y-intercept

    const sq = (v) => v * v
    const m = (p2.y - p1.y) / (p2.x - p1.x)
    const n = p2.y - m * p2.x
    let a, b, c

    if (p2.x - p1.x === 0) {
      // vertical line
      a = 1
      b = -2 * this.y
      c = sq(this.y) + sq(p1.x - this.x) - sq(this.r)
    } else {
      a = 1 + sq(m)
      b = -this.x * 2 + m * (n - this.y) * 2
      c = sq(this.x) + sq(n - this.y) - sq(this.r)
    }

    // get discriminant
    const d = sq(b) - 4 * a * c
    if (d >= 0) {
      // insert into quadratic formula
      let intersections = [
        (-b + Math.sqrt(sq(b) - 4 * a * c)) / (2 * a),
        (-b - Math.sqrt(sq(b) - 4 * a * c)) / (2 * a),
      ]

      if (d === 0) {
        intersections = [intersections[0]]
      }

      if (p2.x - p1.x === 0) {
        return intersections.map((y) => new Victor(p1.x, y))
      } else {
        return intersections.map((x) => new Victor(x, m * x + n))
      }
    }

    // no intersection
    return []
  }

  // returns the points at which the circle intersects a given rectangle
  // could not find an optimized algorithm, so this checks all sides of the rectangle one-by-one.
  rectangleIntersection(p1, p2, p3, p4) {
    return [
      this.lineIntersection(p1, p2),
      this.lineIntersection(p2, p3),
      this.lineIntersection(p3, p4),
      this.lineIntersection(p4, p1),
    ]
      .flat()
      .filter((n) => n && n.y !== Infinity && n.y !== -Infinity)
  }
}
