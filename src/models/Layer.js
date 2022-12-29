import Model, { modelOptions } from './Model'
import { morphOptions, initialMorphState } from './Morph'

export const layerOptions = {
  ...{
    name: {
      title: 'Name',
      type: 'text'
    }
  },
  ...modelOptions,
  ...morphOptions,
  ...{
    reverse: {
      title: 'Reverse path',
      type: 'checkbox',
    },
    connectionMethod: {
      title: 'Connect to next layer',
      type: 'togglebutton',
      choices: ['line', 'along perimeter']
    },
  }
}

export default class Layer extends Model {
  getInitialState() {
    return {
      ...super.getInitialState(),
      ...initialMorphState(),
      ... {
        reverse: false,
        connectionMethod: 'line',
        dragging: false,
        visible: true
      }
    }
  }

  getOptions() {
    return layerOptions
  }
}
