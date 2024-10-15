import { functionValue } from "@/common/util"

const options = []

export default class Model {
  constructor(type, state) {
    this.type = type
    this.state = state

    Object.assign(this, {
      usesMachine: false,
      usesFonts: false,
      dragging: false,
      stretch: false,
      randomizable: true,
    })
  }

  // override as needed
  canChangeSize(state) {
    return true
  }

  // override as needed
  canChangeAspectRatio(state) {
    return this.canChangeSize(state)
  }

  // override as needed
  canRotate(state) {
    return true
  }

  // override as needed
  canMove(state) {
    return true
  }

  canTransform(state) {
    return (
      this.canMove(state) || this.canRotate(state) || this.canChangeSize(state)
    )
  }

  // override as needed; redux state of a newly created instance
  getInitialState() {
    return {}
  }

  getOptions() {
    return options
  }

  randomChanges(layer, exclude = []) {
    const changes = { id: layer.id }
    const options = this.getOptions()

    Object.keys(options).forEach((key) => {
      if (!exclude.includes(key)) {
        const change = this.randomChange(key, layer, options)

        if (change != null) {
          changes[key] = change
        }
      }
    })

    return changes
  }

  // given an option key, make a random change based on model options
  randomChange(key, layer, options) {
    const settings = options[key]
    const random = settings.random == null ? 1 : settings.random
    const randomize = Math.random() <= random
    const type = settings.type

    if (type == "checkbox") {
      const defaults = this.getInitialState()
      let value = defaults[key]

      if (random && Math.random() <= 0.5) {
        value = !value
      }

      return value
    } else if (type == "togglebutton" || type == "dropdown") {
      let choices = functionValue(settings.choices, layer)
      const choice = Math.floor(Math.random() * choices.length)

      return choices[choice]
    } else if (type == "number" || type == null) {
      const defaults = this.getInitialState()
      let min = settings.randomMin
      if (min == null) {
        min = functionValue(settings.min, layer) || 0
      }
      let max = settings.randomMax || functionValue(settings.max, layer)
      if (max == null) {
        max = defaults[key] * 3
      }
      const step = settings.step || 1

      if (randomize) {
        const random = Math.random() * (max - min) + min
        let precision, value

        if (step >= 1) {
          value = Math.round(random)
        } else {
          precision = Math.round(1 / step)
          value = Math.round(random * precision) / precision
        }

        return value
      } else {
        return min
      }
    }
  }
}
