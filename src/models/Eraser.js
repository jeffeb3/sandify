import Shape, { shapeOptions, shapeAttrs } from './Shape'

export const eraserOptions = {
}

export const eraserAttrs = {
  selectGroup: 'Erasers',
  canMorph: false,
  usesMachine: true,
}

export default class Eraser extends Shape {
  getOptions() {
    return eraserOptions
  }
  getAttrs() {
    return eraserAttrs
  }
}
