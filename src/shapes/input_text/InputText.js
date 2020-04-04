import { CursiveFont, SansSerifFont, MonospaceFont } from './Fonts'
import { Vertex } from '../../common/Geometry'
import Shape, { shapeOptions } from '../Shape'

const options = {
  ...shapeOptions,
  ...{
    inputText: {
      title: 'Text',
      type: 'textarea',
    },
    inputFont: {
      title: 'Font',
      type: 'dropdown',
      choices: ['Cursive', 'Sans Serif', 'Monospace'],
    },
  }
}

export default class InputText extends Shape {
  constructor() {
    super('Text')
  }

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...{
        type: 'inputText',
        inputText: 'Sandify',
        inputFont: 'Cursive',
        repeatEnabled: false,
        startingSize: 50
      }
    }
  }

  getVertices(state) {
    let points = []
    let prevLetter = ''
    let x = 0.0
    for (let chi = 0; chi < state.shape.inputText.length; chi++) {
      var letter = state.shape.inputText[chi]
      if (prevLetter === 'b' || prevLetter === 'v' || prevLetter === 'o' || prevLetter === 'w') {
        prevLetter = letter
        if (letter.search('/[a-z]/') === -1 && state.shape.inputFont === 'Cursive')
        {
          letter = letter + '*'
        }
      }
      else {
        prevLetter = letter
      }

      var shape = undefined
      if (state.shape.inputFont === 'Cursive') {
        shape = CursiveFont(letter)
      } else if (state.shape.inputFont === 'Sans Serif') {
        shape = SansSerifFont(letter)
      } else if (state.shape.inputFont === 'Monospace') {
        shape = MonospaceFont(letter)
      } else {
        // Internal error, but I'm going to just recover
        shape = CursiveFont(letter)
      }

      for (let vi = 0; vi < shape.vertices.length; vi++) {
        points.push(Vertex(shape.vertices[vi].x + x, shape.vertices[vi].y))
      }
      x += shape.vertices[shape.vertices.length-1].x
    }
    let widthOffset = x / 2.0
    return points.map( (point) => {
      return Vertex(point.x - widthOffset, point.y)
    })
  }

  getOptions() {
    return options
  }
}
