export default class Effect {
  constructor(type) {
    this.type = type
  }

  // redux state of a newly created instance
  getInitialState() {
    return {}
  }
}
