import Layer, { layerOptions } from './Layer'

export const groupOptions = {
  ...layerOptions,
  ...{
    // TODO
  }
}

export default class Group extends Layer {
  getInitialState() {
    return {
      ...super.getInitialState(),
      ... {
        // TODO
      }
    }
  }

  getOptions() {
    return groupOptions
  }
}
