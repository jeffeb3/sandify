import { CursiveFont, SansSerifFont, MonospaceFont } from './Fonts'
import { Vertex } from '../../common/Geometry'
import inputTextReducer, {
  setShapeInputText,
  setShapeInputFont
} from './inputTextSlice.js'

export class InputText {
  static initialState() {
    return {
      input_text: "Sandify",
      input_font: "Cursive",
    }
  }

  static reducer(state, action) {
    return inputTextReducer(state, action)
  }

  static mapState(state, ownProps) {
    return {
      input_text: state.shapes.input_text,
      input_font: state.shapes.input_font,
    }
  }

  static mapDispatch(dispatch, ownProps) {
    return {
      onInputTextChange: (event) => {
        dispatch(setShapeInputText(event.target.value));
      },
      onInputFontChange: (event) => {
        dispatch(setShapeInputFont(event));
      },
    }
  }

  static getInfo() {
    return {
      name: "Text",
      vertices: (state) => {
        let points = [];
        let prevLetter = "";
        let x = 0.0;
        for (let chi = 0; chi < state.shapes.input_text.length; chi++) {
          var letter = state.shapes.input_text[chi];
          if (prevLetter === 'b' || prevLetter === 'v' || prevLetter === "o" || prevLetter === 'w') {
            prevLetter = letter
            if (letter.search('/[a-z]/') === -1 && state.shapes.input_font === 'Cursive')
            {
              letter = letter + "*";
            }
          }
          else {
            prevLetter = letter
          }

          var shape;
          if (state.shapes.input_font === 'Cursive') {
            shape = CursiveFont(letter);
          } else if (state.shapes.input_font === 'Sans Serif') {
            shape = SansSerifFont(letter);
          } else if (state.shapes.input_font === 'Monospace') {
            shape = MonospaceFont(letter);
          } else {
            // Internal error, but I'm going to just recover
            shape = CursiveFont(letter);
          }


          for (let vi = 0; vi < shape.vertices.length; vi++) {
            points.push(Vertex(shape.vertices[vi].x + x, shape.vertices[vi].y));
          }
          x += shape.vertices[shape.vertices.length-1].x;
        }
        let widthOffset = x / 2.0;
        return points.map( (point) => {
          return Vertex(point.x - widthOffset, point.y);
        });
      },
      options: [
        {
          title: "Text",
          type: "textarea",
          key: "inputText",
          value: (props) => { return props.input_text },
          onChange: (props) => { return props.onInputTextChange }
        },
        {
          title: "Font",
          type: "dropdown",
          choices: ["Cursive", "Sans Serif", "Monospace"],
          value: (props) => { return props.input_font },
          onChange: (props) => { return props.onInputFontChange }
        },
      ],
    }
  }
}
