import { morphOptions, initialMorphState } from './Morph'

export const effectOptions = {
  ...morphOptions
}

export default class Effect {
  constructor(type) {
    this.type = type
  }

  getInitialState() {
    return {
      ...initialMorphState(),
    }
  }

}
