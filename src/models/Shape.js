import Model, { modelOptions } from './Model'

export const shapeOptions = {
}

export const shapeAttrs = {
}

export default class Shape extends Model {
  getOptions() {
    return shapeOptions
  }
  getAttrs() {
    return shapeAttrs
  }
}
