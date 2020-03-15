import React, { Component } from 'react';
import {
  Col,
  ControlLabel,
  Form,
  FormControl,
  FormGroup,
  ListGroupItem,
  Panel,
  MenuItem,
  DropdownButton
} from 'react-bootstrap'
import './Shape.css'

export const disableEnter = (event) => {
  if (event.key === 'Enter' && event.shiftKey === false) {
    event.preventDefault();
  }
};

class Shape extends Component {
  render() {
    var activeClassName = "";
    if (this.props.active) {
      activeClassName = "active";
    }

    var options_render = this.props.options.map( (option) => {
      if (option.type && option.type === "dropdown") {
        return <FormGroup controlId="options-step" key={option.title}>
                 <Col componentClass={ControlLabel} sm={4}>
                   {option.title}
                 </Col>
                 <Col sm={8}>
                   <DropdownButton bsStyle="default"
                                   id="dropdown-basic-button"
                                   title={option.value()}
                                   onSelect={(event) => {
                                       option.onChange(event);
                                   }}
                                   onKeyDown={disableEnter}>
                     {option.choices.map((choice) => {
                         return <MenuItem key={choice} eventKey={choice}>{choice}</MenuItem>;
                     })}
                   </DropdownButton>
                 </Col>
               </FormGroup>
      } else {
        return <FormGroup controlId="options-step" key={option.title}>
                 <Col componentClass={ControlLabel} sm={4}>
                   {option.title}
                 </Col>
                 <Col sm={8}>
                   <FormControl
                     type={option.type ? option.type : "number"}
                     step={option.step ? option.step : 1}
                     value={option.value()}
                     onChange={(event) => {
                       option.onChange(event)
                     }}
                     onKeyDown={disableEnter}/>
                 </Col>
               </FormGroup>
      }
    })

    var options_list_render = undefined;
    var link_render = undefined;

    if (this.props.link) {
      link_render = <p>See <a target="_blank" rel="noopener noreferrer" href={this.props.link}>{this.props.link}</a> for ideas</p>;
    }

    if (this.props.options.length >= 1) {
      options_list_render =
        <div className="shape-options">
          <Panel className="options-panel" collapsible expanded={this.props.active}>
            <Form horizontal>
              {link_render}
              {options_render}
            </Form>
          </Panel>
        </div>
    }

    return (
      <div className="shape">
        <ListGroupItem className={activeClassName} onClick={this.props.clicked}>{this.props.name}</ListGroupItem>
            {options_list_render}
      </div>
    )
  }
}

export default Shape
