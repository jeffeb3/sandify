import Vicious1Vertices from './Vicious1Vertices'
import Shape from '../Shape'

export default class V1Engineering extends Shape {
  constructor() {
    super('V1Engineering')
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        type: 'v1Engineering',
      }
    }
  }

  getVertices(state) {
    return Vicious1Vertices()
  }
}
