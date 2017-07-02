import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import {
    Button,
    ButtonGroup,
    Col,
    ControlLabel,
    DropdownButton,
    Form,
    FormControl,
    FormGroup,
    FornGroup,
    ListGroup,
    ListGroupItem,
    MenuItem,
    Panel,
} from 'react-bootstrap'
import TurtleCanvas from './TurtleCanvas';

class App extends Component {
  render() {

    function saySquare() {
        alert('Square!')
    }

    function sayTriangle() {
        alert('Triangle!')
    }

    return (
      <div className="App">

        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>sandify</h2>
          <p>
            web based user interface to create patterns that
            could be useful for robots that draw in sand with ball bearings.
          </p>
        </div>

        <div className="App-left">
          Sandify is working on a solution to turn your cold, empty hearted, emotionless sand tables into cold, empty hearted emotionless sand table robots with enchanting patterns.
          <br/>
          See the birthplace here:
          <br/>
          <a href="https://www.vicious1.com/forum/topic/does-this-count-as-a-build/">Vicious1.com Forum</a>
        </div>

        <div className="App-mid">

          <ListGroup>
            <ListGroupItem header="Square" active onClick={saySquare}>4 sided shape with equal sides and 90 degree angles</ListGroupItem>
            <ListGroupItem header="Triangle" onClick={sayTriangle}>3 sided shape with equal sides and 120 degree angles</ListGroupItem>
          </ListGroup>

          <ButtonGroup>
            <Button id="rotate" active>Spin</Button>
            <Button id="scale">Grow</Button>
          </ButtonGroup>

          <Panel id="rotate-options" collapsible expanded={true}>
            <Form horizontal>
              <FormGroup controlId="rotate-step">
                <Col componentClass={ControlLabel} sm={2}>
                  Spin Speed
                </Col>
                <Col sm={10}>
                  <FormControl type="number"/>
                </Col>
              </FormGroup>
            </Form>
          </Panel>

          <Panel id="scale-options" collapsible expanded={true}>
            <Form horizontal>
              <FormGroup controlId="scale-step">
                <Col componentClass={ControlLabel} sm={2}>
                  Scale Speed
                </Col>
                <Col sm={10}>
                  <FormControl type="number"/>
                </Col>
              </FormGroup>
            </Form>
          </Panel>

          <div>
            <TurtleCanvas width={300} height={300} rotation={45}/>
          </div>

          <Button id="gcode" bsStyle="primary">Generate GCode</Button>
        </div>
      </div>
    );
  }
}

export default App;
