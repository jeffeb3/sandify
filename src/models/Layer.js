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
      isVisible: (state) => { return !state.effect }
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
        open: true,
        reverse: false,
        connectionMethod: 'line',
        shouldCache: true,
        autosize: true,
        canChangeSize: true,
        canChangeHeight: true,
        canRotate: true,
        canMove: true,
        usesMachine: false,
        usesFonts: false,
        dragging: false,
        visible: true
      }
    }
  }

  getOptions() {
    return layerOptions
  }
}
