import Vicious1Vertices from "./Vicious1Vertices"
import Shape from "../Shape"
import i18next from 'i18next'

export default class V1Engineering extends Shape {
  constructor() {
    super("v1Engineering")
    this.label = i18next.t('shapes.v1Engineering.v1Engineering')
    this.link = "https://www.v1e.com/"
    this.linkText = i18next.t('shapes.v1Engineering.linkText')
    this.description = i18next.t('shapes.v1Engineering.description')
    this.randomizable = false
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        // no custom attributes
      },
    }
  }

  getVertices(state) {
    return Vicious1Vertices()
  }
}
