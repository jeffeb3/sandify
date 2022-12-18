import Model from './Model'

export default class Effect extends Model {
  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        effect: true,
        shouldCache: false,
        canChangeSize: true,
        autosize: false
      }
    }
  }
}
