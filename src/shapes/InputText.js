import { Font2 } from './Fonts';
import { Vertex } from '../Geometry';

export const setShapeInputText = ( text ) => {
  return {
    type: 'SET_SHAPE_INPUT_TEXT',
    value: text,
  };
}

export class InputText {
  static mapStateToProps(state, ownProps) {
    return {
      inputText: state.shapes.inputText,
    }
  }

  static mapDispatchToProps(dispatch, ownProps) {
    return {
      onInputTextChange: (event) => {
        dispatch(setShapeInputText(event.target.value));
      },
    }
  }

  static getParams(parent) {
    return {
      name: "Text",
      vertices: (state) => {
        let points = [];
        const under_y = -0.25;
        points.push(Vertex(0.0, under_y))
        let x = 0.0;
        for (let chi = 0; chi < state.shapes.inputText.length; chi++) {
          var letter = Font2(state.shapes.inputText[chi]);
          if (0 < letter.vertices.length) {
            points.push(Vertex(x + letter.vertices[0].x, under_y))
          }
          for (let vi = 0; vi < letter.vertices.length; vi++) {
            points.push(Vertex(letter.vertices[vi].x + x, letter.vertices[vi].y));
          }
          if (0 < letter.vertices.length) {
            points.push(Vertex(x + letter.vertices[letter.vertices.length-1].x, under_y))
          }
          if (chi !== state.shapes.inputText.length-1) {
            points.push(Vertex(x + letter.max_x, under_y))
          }
          x += letter.max_x;
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
          value: () => { return parent.props.inputText },
          onChange: parent.props.onInputTextChange,
        },
      ],
    };
  }

  static getReducer(state, action) {
    switch(action.type) {
      case 'SET_SHAPE_INPUT_TEXT':
        return {...state,
          inputText: action.value,
        };

      default:
        return state;
    }
  }
}
