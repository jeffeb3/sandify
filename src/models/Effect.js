import Model from "./Model"

export default class Effect extends Model {
  constructor() {
    super()
    this.shouldCache = false
    this.canChangeSize = true
    this.autosize = false
    this.effect = true
  }
}
