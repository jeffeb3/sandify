import Victor from 'victor'

export class Circle extends Victor {
  constructor(x, y, state) {
    super(x, y)
    this.x = x
    this.y = y
    this.r = state.circleRadius || 30
    this.state = state
    this.growing = true
    this.theta = null
    this.center = new Victor(0, 0)
  }

  grow() {
    if (this.growing) {
      this.r += 1
    }
  }

  outOfBounds() {
    return this.state.rectangular ? this.outOfRectangularBounds() : this.outOfPolarBounds()
  }

  outOfPolarBounds() {
    const delta = this.state.inBounds ? this.r : 0
    return this.state.radius <= this.distance(this.center) + delta
  }

  outOfRectangularBounds() {
    const delta = this.state.inBounds ? this.r : 0

    // account for origin-based coordinates
    const localX = this.x + this.state.width / 2
    const localY = this.y + this.state.height / 2

    // setting theta as the angle of intersection with our bounds
    if (localX + delta > this.state.width) {
      this.theta = 0
      return true
    } else if (localX - delta < 0) {
      this.theta = Math.PI
      return true
    } else if (localY + delta > this.state.height) {
      this.theta = Math.PI/2
      return true
    } else if (localY - delta < 0) {
      this.theta = 3*Math.PI/2
      return true
    }

    return false
  }

  intersection(circle) {
    let a = circle.r
    var b = this.r
    var c = Math.sqrt((this.x-circle.x)*(this.x-circle.x)+(this.y-circle.y)*(this.y-circle.y))
    var d = (b*b+c*c-a*a)/(2*c)
    var h = Math.sqrt(b*b-d*d)
    const i1 = (circle.x-this.x)*d/c + (circle.y-this.y)*h/c +  this.x
    const i2 = (circle.y-this.y)*d/c - (circle.x-this.x)*h/c +  this.y
    const i3 = (circle.x-this.x)*d/c - (circle.y-this.y)*h/c +  this.x
    const i4 = (circle.y-this.y)*d/c + (circle.x-this.x)*h/c +  this.y
    const ret = []

    if (!isNaN(i1)) {
      ret.push(new Victor(i1, i2))
    }
    if (!isNaN(i3)) {
      ret.push(new Victor(i3, i4))
    }

    return ret
  }
}
