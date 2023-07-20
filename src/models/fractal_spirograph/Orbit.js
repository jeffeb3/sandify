export default class Orbit {
  constructor(x, y, r, level, settings, parent) {
    this.x = x
    this.y = y
    this.r = r
    this.child = null
    this.angle = Math.PI / 2
    this.level = level
    this.settings = settings

    let sign = this.settings.alternateRotation ? -1 : 1
    this.speed =
      (Math.pow(settings.velocity * sign, this.level - 1) * Math.PI) /
      180 /
      settings.resolution
    this.parent = parent
  }

  addChild() {
    let newr = this.r / this.settings.relativeSize
    let newx = this.x + this.r + newr
    let newy = this.y
    this.child = new Orbit(
      newx,
      newy,
      newr,
      this.level + 1,
      this.settings,
      this,
    )
    return this.child
  }

  update() {
    if (this.parent) {
      this.angle += this.speed

      let rsum = this.r + this.parent.r
      this.x = this.parent.x + rsum * Math.cos(this.angle)
      this.y = this.parent.y + rsum * Math.sin(this.angle)
    }
  }
}
