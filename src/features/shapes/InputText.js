import { CursiveFont, SansSerifFont, MonospaceFont } from './Fonts';
import { Vertex } from '../common/Geometry';

export const setShapeInputText = ( text ) => {
  return {
    type: 'SET_SHAPE_INPUT_TEXT',
    value: text,
  };
}

export const setShapeInputFont = ( font ) => {
  return {
    type: 'SET_SHAPE_INPUT_FONT',
    value: font,
  };
}

export class InputText {
  static mapStateToProps(state, ownProps) {
    return {
      input_text: state.shapes.input_text,
      inputFont: state.shapes.inputFont,
    }
  }

  static mapDispatchToProps(dispatch, ownProps) {
    return {
      onInputTextChange: (event) => {
        dispatch(setShapeInputText(event.target.value));
      },
      onInputFontChange: (event) => {
        dispatch(setShapeInputFont(event));
      },
    }
  }

  static getParams(parent) {
    return {
      name: "Text",
      vertices: (state) => {
        let points = [];
        let prevLetter = "";
        let x = 0.0;
        for (let chi = 0; chi < state.shapes.input_text.length; chi++) {
          var letter = state.shapes.inputText[chi];
          if (prevLetter === 'b' || prevLetter === 'v' || prevLetter === "o" || prevLetter === 'w') {
            prevLetter = letter
            if (letter.search('/[a-z]/') === -1 && state.shapes.inputFont === 'Cursive')
            {
              letter = letter + "*";
            }
          }
          else {
            prevLetter = letter
          }

          var shape;
          if (state.shapes.inputFont === 'Cursive') {
            shape = CursiveFont(letter);
          } else if (state.shapes.inputFont === 'Sans Serif') {
            shape = SansSerifFont(letter);
          } else if (state.shapes.inputFont === 'Monospace') {
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
          value: () => { return parent.props.input_text },
          onChange: parent.props.onInputTextChange,
        },
        {
          title: "Font",
          type: "dropdown",
          choices: ["Cursive", "Sans Serif", "Monospace"],
          value: () => { return parent.props.inputFont },
          onChange: parent.props.onInputFontChange,
        },
      ],
    };
  }

  static getReducer(state, action) {
    switch(action.type) {
      case 'SET_SHAPE_INPUT_TEXT':
        return {...state,
          input_text: action.value,
        };

      case 'SET_SHAPE_INPUT_FONT':
        return {...state,
          inputFont: action.value,
        };

      default:
        return state;
    }
  }
}
