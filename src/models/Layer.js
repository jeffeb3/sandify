import Model, { modelOptions } from './Model'

export const layerOptions = {
  ...modelOptions,
  ...{
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
      ... {
        open: true,
        connectionMethod: 'line',
      }
    }
  }

  getOptions() {
    return layerOptions
  }
}
