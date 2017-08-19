
import React, { Component } from 'react';
import {
    FormControl,
    FormGroup,
} from 'react-bootstrap'
import { connect } from 'react-redux'

// brace is needed for the theme and the language spec, but it warns because I'm not using it
// directly, so I'm disabling this warning.
// eslint-disable-next-line
import brace from 'brace'
import 'brace/mode/java'
import 'brace/theme/monokai'

import AceEditor from 'react-ace';

import {
  clearVertices,
  setTurtleCode,
  setTurtleCommand,
  setTurtleVertices,
} from '../reducers/Index.js';

import {
  Vertex,
} from '../Geometry';

import {
  Turtle,
  reset,
  forward,
  angle,
  right,
  left,
} from './PureTurtle.js';

import './TurtleEditor.css'

const mapStateToProps = (state, ownProps) => {
  return {
    code: state.turtleCode,
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onChange: (code) => {
      dispatch(setTurtleCode(code))
    },
    execute: (command) => {
      dispatch(setTurtleCommand(command))
    },
    clearDrawing: () => {
      dispatch(clearVertices());
    },
    setVertices: (vertices) => {
      dispatch(setTurtleVertices(vertices));
    },
  }
}

let ReduxTurtle = (addVertex) => {

  let turtle = Turtle();
  let saveVertex = () => {
    addVertex(Vertex(turtle.x, turtle.y));
  }

  return Object.assign(
    {},
    turtle,
    {
      reset: () => {
        reset(turtle);
        saveVertex();
      },
      forward: (distance) => {
        forward(turtle, distance);
        saveVertex();
      },
      angle: (angle_deg) => {
        angle(turtle, angle_deg);
      },
      right: (angle_deg) => {
        right(turtle, angle_deg);
      },
      left: (angle_deg) => {
        left(turtle, angle_deg);
      },
      saveVertex: saveVertex,
    });
}

class TurtleEditor extends Component {

  constructor(props) {
    super(props);

    // this.vertices is not part of this.state, because it's not needed for drawing, and it's nice
    // to avoid the state. It can be published to the reducer with publishVertices()
    this.vertices = [];

    this.turtle = ReduxTurtle(this.addVertex.bind(this));

    this.doCommand = this.doCommand.bind(this);
  }

  componentDidMount() {
    this.doCommand("");
  }

  addVertex(vertex) {
    this.vertices.push(vertex);
  }

  doCommand(command) {
    this.props.clearDrawing();
    this.vertices = [];

    this.turtle.reset();
    const reset = this.turtle.reset;
    const forward = this.turtle.forward;

    try {
      console.log('code:' + this.props.code);
      // execute any code in the editor
      eval(this.props.code);

      console.log('command:' + command);
      // execute the command
      eval(command);

    } catch (e) {
      alert("Exception thrown in Turtle Code, please see console");
      throw e;
    }

    this.props.setVertices(this.vertices);
  }

  render() {
    return (
      <div id="editor">
        <AceEditor
          mode="java"
          theme="monokai"
          onChange={this.props.onChange}
          name="Turtle Editor"
          editorProps={{
            $blockScrolling: Infinity
          }}
          width="300px"
          value={this.props.code}
        />
        <FormGroup controlId="command">
          <FormControl
            type="text"
            label="Command"
            placeholder="square(10)"
            onKeyPress={ (event) => {
              if (event.key === "Enter") {
                this.doCommand(event.target.value)
              }
            }}
          />
        </FormGroup>
      </div>
    )
  }
}
TurtleEditor = connect(mapStateToProps, mapDispatchToProps)(TurtleEditor)

export default TurtleEditor;
