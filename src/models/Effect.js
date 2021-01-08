import Shape from './Shape'

export default class Effect extends Shape {
  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        effect: true,
        canTransform: false,
        shouldCache: false,
        canChangeSize: true,
        repeatEnabled: false,
        autosize: false
      }
    }
  }
}
