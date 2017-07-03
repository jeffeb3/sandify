import React, { Component } from 'react';
import {
    Button,
    ButtonGroup,
    Col,
    ControlLabel,
    Form,
    FormControl,
    FormGroup,
    Panel,
} from 'react-bootstrap'
import './Transforms.css'

class Transforms extends Component {
  render() {
    return (
      <div className="transforms">
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

      </div>
    );
  }
}

export default Transforms

