import Victor from 'victor'

export class Circle extends Victor {
  constructor(x, y, state) {
    super(x, y)
    this.x = x
    this.y = y
    this.r = 40
    this.state = state
    this.growing = true
    this.theta = null
  }

  grow() {
    if (this.growing) {
      this.r += 1
    }
  }

  edges() {
    // setting theta as the angle of intersection with our bounds
    if (this.x + this.r > this.state.width) {
      this.theta = 0
      return true
    } else if (this.x - this.r < 0) {
      this.theta = Math.PI
      return true
    } else if (this.y + this.r > this.state.height) {
      this.theta = Math.PI/2
      return true
    } else if (this.y - this.r < 0) {
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

    if (i1 !== NaN) {
      ret.push(new Victor(i1, i2))
    }
    if (i3 !== NaN) {
      ret.push(new Victor(i3, i4))
    }

    return ret
  }
}
