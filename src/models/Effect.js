import Model from "./Model"

export default class Effect extends Model {
  constructor() {
    super()
    this.shouldCache = false
    this.autosize = false
    this.effect = true
  }
}
