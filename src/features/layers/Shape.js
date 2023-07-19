import Layer, { layerOptions } from './Layer'

export const shapeOptions = {
  ...layerOptions
}

export default class Shape extends Layer {
  getOptions() {
    return shapeOptions
  }
}
