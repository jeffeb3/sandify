import Victor from 'victor'
import Shape, { shapeOptions } from './Shape'

const options = {
  ...shapeOptions,
  ...{
    fileName: {
      title: 'From file:',
      type: 'inputText',
      plainText: 'true'
    },
    zoom: {
      title: 'Zoom',
      min: 1
    },
    aspectRatio: {
      title: 'Aspect Ratio',
      type: 'checkbox'
    },
    comments: {
      title: 'Comments',
      type: 'textarea',
      plainText: true
    },
  }
}

export default class FileImport extends Shape {
  constructor() {
    super('FileImport')
  }

  getInitialState(importProps) {

    return {
      ...super.getInitialState(),
      ...{
        type: 'file_import',
        aspectRatio: true,
        originalAspectRatio: 1.0,
        vertices: [],
        selectGroup: 'import',
        canTransform: false,
        canChangeSize: false,
        repeatEnabled: false,
        zoom: 100
      },
      ...(importProps === undefined ? {} : importProps)
    }
  }

  getVertices(state) {
    if (state.shape.vertices.length < 1)
    {
      // During initialization, this function gets called, but the machine isn't created right yet.
      return [new Victor(0.0, 0.0), new Victor(0.0, 0.1)]
    }

    let x_scale = (state.machine.maxX - state.machine.minX)/2.0 * 0.01 * state.shape.zoom
    let y_scale = (state.machine.maxY - state.machine.minY)/2.0 * 0.01 * state.shape.zoom

    if (!state.machine.rectangular) {
      x_scale = y_scale = state.machine.maxRadius * 0.01 * state.shape.zoom
    }

    if (state.shape.aspectRatio) {
      const machine_aspect_ratio = y_scale / x_scale
      if (state.shape.originalAspectRatio > machine_aspect_ratio) {
        x_scale = x_scale / state.shape.originalAspectRatio * machine_aspect_ratio
      } else {
        y_scale = y_scale * state.shape.originalAspectRatio / machine_aspect_ratio
      }
    }

    return state.shape.vertices.map( (vertex) => {
      return Victor( vertex.x * x_scale, vertex.y * y_scale )
    })
  }

  getOptions() {
    return options
  }
}
